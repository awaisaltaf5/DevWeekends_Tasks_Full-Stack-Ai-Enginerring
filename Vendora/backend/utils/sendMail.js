const nodemailer = require("nodemailer");

// @emailjs/nodejs is optional — EmailJS is the PRIMARY transport only when
// EMAILJS_SERVICE_ID + EMAILJS_PUBLIC_KEY are present in the environment.
let emailjs = null;
let emailjsInitialized = false;
        try {
  emailjs = require("@emailjs/nodejs");
} catch (_) {
  /* SDK not installed — EmailJS transport stays unavailable; SMTP still works. */
}

const initEmailJS = () => {
  if (emailjsInitialized) return true;
  if (
    emailjs &&
    process.env.EMAILJS_SERVICE_ID &&
    process.env.EMAILJS_PUBLIC_KEY
  ) {
        try {
            emailjs.init({
              publicKey: process.env.EMAILJS_PUBLIC_KEY,
              privateKey: process.env.EMAILJS_PRIVATE_KEY,
      });
      emailjsInitialized = true;
    } catch (e) {
      console.error("[mail] EmailJS init failed:", e.message);
    }
  }
  return emailjsInitialized;
};

/**
 * Production-grade SMTP helper.
 *
 * Best-practice reliability measures for intermittent "sometimes sends, sometimes not"
 * behavior:
 *
 * 1. POOLED TRANSPORTER — one reusable connection pool instead of a brand-new
 *    transporter (and cold TLS handshake) on every single send. Reconnection is
 *    handled by nodemailer automatically.
 * 2. EXPLICIT TIMEOUTS — so a hung/half-open connection never stalls the request.
 * 3. AUTOMATIC RETRY with exponential backoff — transient network / SMTP 4xx
 *    errors are retried up to MAX_ATTEMPTS times instead of giving up immediately.
 * 4. FAIL-SOFT BOUNDARY — callers can request non-blocking behavior; even on final
 *    failure the error is thrown so a route can decide to still complete the primary
 *    action (e.g. finish registration) while logging the mail failure.
 */

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 500;

let cachedTransporter = null;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS " +
        "(and EMAIL_FROM) in your .env to send emails."
    );
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 → implicit TLS; 587 → STARTTLS
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 10000,  // 10s to establish connection
      greetingTimeout: 10000,    // 10s for server greeting
      socketTimeout: 20000,      // 20s for socket activity
    });

    // Never keep a broken pool forever — throw it away so the next send rebuilds it.
    cachedTransporter.on("error", () => {
        try {
        cachedTransporter && cachedTransporter.close();
      } catch (_) {
        /* ignore */
      }
      cachedTransporter = null;
    });
  }

  return cachedTransporter;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (err) => {
  if (!err) return false;
  const code = String(err && (err.code || err.responseCode) || "");
  // TLS/connect/handshake breakdowns, DNS, refused, rate-limit, and transient
  // 4xx/5xx (incl. 429) are retryable; permanent 4xx is not.
  return (
    /ECONNECTION|ECONNRESET|ETIMEDOUT|ESOCKET|ETLS|ECONNREFUSED|EAI_AGAIN/i.test(code) ||
    /^4\d\d$/.test(code) ||
    /^429$/.test(code) ||
    /^5\d\d$/.test(code) ||
    /socket hang up|host not found|connection|timed out|timeout|rate limit|429/i.test(
      err && err.message || ""
    )
  );
};

/**
 * Send an email with retries and fail-soft support.
 *
 * Transport selection (first available wins):
 *   1. EmailJS HTTP API  — when EMAILJS_SERVICE_ID + EMAILJS_PUBLIC_KEY + a
 *      template id are configured. The recipient, subject and HTML body are
 *      passed as template params to a simple EmailJS template that renders
 *      {{user_email}} / {{subject}} / {{message_html}}.
 *   2. SMTP (Brevo etc.) — pooled nodemailer fallback (see getTransporter()).
 *
 * @param {object} options
 * @param {string} options.email              recipient
 * @param {string} options.subject
 * @param {string} [options.message]          plain-text body
 * @param {string} [options.html]             html body
 * @param {string} [options.templateId]       override the default EmailJS template id
 * @param {object} [options.templateParams]   extra vars merged into EmailJS template_params
 * @param {boolean} [options.throws=false]    if true, throw on final failure (blocking);
 *        if false (default) log and resolve — callers should NOT fail the whole
 *        request just because a transient email error occurred.
 */
const sendMail = async (options) => {
  const shouldThrow = options.throws === true;
  const recipient = options.email;
  const subject = options.subject;
  const messageHtml = options.html || options.message || "";
  let lastErr;

  // ---- 1) EmailJS HTTP API (primary) ----
  if (recipient && initEmailJS()) {
        const templateId =
      options.templateId ||
      (options.template === "order"
        ? process.env.EMAILJS_TEMPLATE_ORDER || process.env.EMAILJS_TEMPLATE_DEFAULT
        : process.env.EMAILJS_TEMPLATE_DEFAULT);
    console.log(
      `[mail] EmailJS template=${templateId} flow=${options.template || "default"} to=${recipient}`
    );
    if (templateId) {
      const templateParams = {
        user_email: recipient,
        subject: subject || "",
        message_html: messageHtml,
        ...(options.templateParams || {}),
      };

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            templateId,
            templateParams,
            {
              publicKey: process.env.EMAILJS_PUBLIC_KEY,
              privateKey: process.env.EMAILJS_PRIVATE_KEY,
            }
          );
          if (attempt > 1) {
            console.log(
              `[mail] EmailJS delivered on attempt ${attempt}/${MAX_ATTEMPTS} to ${recipient}`
            );
          }
          return { provider: "emailjs", to: recipient };
          } catch (err) {
          lastErr = err;
          const retryable = isRetryable(err);
          const errDetail = err && typeof err === "object"
            ? JSON.stringify(err)
            : String(err);
          console.warn(
            `[mail] EmailJS attempt ${attempt}/${MAX_ATTEMPTS} failed for ${recipient} ` +
              `(retryable=${retryable}): ${err.message || errDetail}`
          );
          if (!retryable || attempt === MAX_ATTEMPTS) break;
          await sleep(BASE_DELAY_MS * 2 ** (attempt - 1)); // 0.5s, 1s, 2s, 4s
        }
      }
      // EmailJS exhausted retries — fall through to SMTP fallback below.
      console.warn(
        `[mail] EmailJS failed for ${recipient}; falling back to SMTP`
      );
    }
  }

  // ---- 2) SMTP / Brevo fallback (pooled nodemailer) ----
  let transporter = null;
        try {
    transporter = getTransporter();
  } catch (e) {
    transporter = null; // SMTP not configured
  }

  if (transporter) {
    const from =
      (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim()) ||
      process.env.SMTP_USER;

    const mailOptions = {
      from,
      to: recipient,
      subject,
      ...(options.html
        ? { html: options.html, text: options.message || undefined }
        : { text: options.message }),
    };

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
        const info = await transporter.sendMail(mailOptions);
        if (attempt > 1) {
          console.log(
            `[mail] SMTP delivered on attempt ${attempt}/${MAX_ATTEMPTS} to ${recipient}`
          );
        }
        return info;
          } catch (err) {
        lastErr = err;
        const retryable = isRetryable(err);
        console.warn(
          `[mail] SMTP attempt ${attempt}/${MAX_ATTEMPTS} failed for ${recipient} ` +
            `(retryable=${retryable}): ${err.message}`
        );
        if (!retryable || attempt === MAX_ATTEMPTS) break;
        await sleep(BASE_DELAY_MS * 2 ** (attempt - 1)); // 0.5s, 1s, 2s, 4s
      }
    }
  }

  // Fail-soft by default: surface the error to the caller but don't crash flows.
  if (lastErr) {
    if (shouldThrow) throw lastErr;
    console.error(
      `[mail] FAILED after retries to ${recipient}: ` +
        (lastErr && lastErr.message)
    );
  } else {
    const cfgErr = new Error(
      "No mail transport configured. Set EMAILJS_SERVICE_ID/EMAILJS_PUBLIC_KEY " +
        "(and EMAILJS_TEMPLATE_DEFAULT) or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in your .env."
    );
    if (shouldThrow) throw cfgErr;
    console.error("[mail]", cfgErr.message);
  }
  return null;
};

module.exports = sendMail;
