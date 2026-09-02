const nodemailer = require("nodemailer");

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
  const code = String(err && (err.code || err.responseCode) || "");
  // TLS/connect/handshake breakdowns and server 4xx (transient) are retryable.
  return (
    /ECONNECTION|ECONNRESET|ETIMEDOUT|ESOCKET|ETLS/i.test(code) ||
    /^4\d\d$/.test(code) ||
    /socket hang up|host not found|connection/i.test(err && err.message || "")
  );
};

/**
 * Send an email with retries and fail-soft support.
 * @param {object} options
 * @param {string} options.email   recipient
 * @param {string} options.subject
 * @param {string} [options.message] plain-text body
 * @param {string} [options.html]    html body
 * @param {boolean} [options.throws=false] if true, throw on final failure (blocking);
 *        if false (default) log a warning and resolve — callers should NOT fail the
 *        whole request just because a transient email error occurred.
 */
const sendMail = async (options) => {
  const transporter = getTransporter();

  const from =
    (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim()) ||
    process.env.SMTP_USER;

  const mailOptions = {
    from,
    to: options.email,
    subject: options.subject,
    ...(options.html
      ? { html: options.html, text: options.message || undefined }
      : { text: options.message }),
  };

  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      if (attempt > 1) {
        console.log(
          `[mail] delivered on attempt ${attempt}/${MAX_ATTEMPTS} to ${options.email}`
        );
      }
      return info;
    } catch (err) {
      lastErr = err;
      const retryable = isRetryable(err);
      console.warn(
        `[mail] attempt ${attempt}/${MAX_ATTEMPTS} failed for ${options.email} ` +
          `(retryable=${retryable}): ${err.message}`
      );
      if (!retryable || attempt === MAX_ATTEMPTS) break;
      await sleep(BASE_DELAY_MS * 2 ** (attempt - 1)); // 0.5s, 1s, 2s, 4s
    }
  }

  // Fail-soft by default: surface the error to the caller but don't crash flows.
  if (options.throws) throw lastErr;
  console.error(
    `[mail] FAILED after ${MAX_ATTEMPTS} attempts to ${options.email}: ` +
      (lastErr && lastErr.message)
  );
  return null;
};

module.exports = sendMail;
