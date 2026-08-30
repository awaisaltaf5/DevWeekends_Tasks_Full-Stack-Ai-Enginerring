const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const googleAllowedOrigins = (import.meta.env.VITE_GOOGLE_ALLOWED_ORIGINS as string | undefined ??
  'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function logGoogleOriginMismatch(): void {
  if (typeof window === 'undefined') return;
  console.warn(
    '[Google sign-in] The current origin is not allowed for this client ID. Add the exact origin below to the Google OAuth Console under Authorized JavaScript origins:',
    {
      currentOrigin: window.location.origin,
      allowedOrigins: googleAllowedOrigins,
      clientId: googleClientId ?? 'missing',
    },
  );
}

interface GoogleCredentialResponse {
  credential: string;
}

/** Minimal subset of Google's PromptMomentNotification used to detect why the
 *  sign-in prompt did not appear. */
export interface PromptMomentNotification {
  isDisplayed?: () => boolean;
  isNotDisplayed?: () => boolean;
  getNotDisplayedReason?: () => string;
  isSkippedMoment?: () => boolean;
  getSkippedReason?: () => string;
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => string;
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        use_fedcm_for_prompt?: boolean;
      }) => void;
      prompt: (callback?: (notification: PromptMomentNotification) => void) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

let scriptPromise: Promise<void> | null = null;
let initialized = false;
let credentialHandler: ((credential: string) => void) | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    const script = existingScript ?? document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Google sign-in.'));
    if (!existingScript) document.head.appendChild(script);
  });
  return scriptPromise;
}

export async function initializeGoogle(
  onCredential: (credential: string) => void,
): Promise<boolean> {
  if (!googleClientId) return false;
  credentialHandler = onCredential;
  await loadGoogleScript();
  if (!initialized && window.google) {
    if (!googleAllowedOrigins.includes(window.location.origin)) {
      logGoogleOriginMismatch();
    }
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: ({ credential }) => credentialHandler?.(credential),
      use_fedcm_for_prompt: true,
    });
    initialized = true;
  }
  return Boolean(window.google && initialized);
}

export function promptGoogle(onFailure?: (reason: string) => void): void {
  if (!initialized) {
    onFailure?.('not_initialized');
    return;
  }
  window.google?.accounts.id.prompt((notification) => {
    if (!notification.isNotDisplayed || !notification.isNotDisplayed()) return;
    const reason = notification.getNotDisplayedReason?.() ?? 'unknown_reason';
    onFailure?.(reason);
  });
}

/** Map a GSI "prompt not displayed" reason to an actionable, user-facing message. */
export function googlePromptFailureMessage(reason: string): string {
  switch (reason) {
    case 'invalid_client':
    case 'missing_client_id':
      return 'The Google sign-in client is not configured correctly. Check VITE_GOOGLE_CLIENT_ID in the frontend .env file.';
    case 'unregistered_origin':
      return `Google rejected this site (origin "${window.location.origin}" is not authorized). Add this exact URL to the OAuth Client\u2019s "Authorized JavaScript origins" in the Google Cloud Console, then restart the dev server.`;
    case 'opt_out_or_invalid_session':
      return 'Google sign-in was cancelled or your Google session is invalid. Sign in to your Google account, then try again.';
    case 'suppressed_by_user':
      return 'Google sign-in was suppressed by the browser. Enable Google/third-party sign-in for this site in your browser\u2019s privacy settings (or allow the popup), then try again.';
    case 'browser_not_supported':
      return 'Your browser does not support Google sign-in. Try Chrome, Edge, Firefox, or Safari.';
    case 'secure_http_required':
      return 'Google sign-in requires a secure (HTTPS) connection. Use HTTPS or a localhost origin.';
    case 'cookie_not_available':
      return 'Third-party cookies are blocked, which Google sign-in needs. Allow third-party cookies for this site, then try again.';
    case 'too_many_requests':
      return 'Too many Google sign-in attempts. Please wait a moment and try again.';
    case 'not_initialized':
      return 'Google sign-in is still loading. Please try again in a second.';
    default:
      return 'Google sign-in could not be shown. Check the Client ID / origin configuration and that third-party sign-in is enabled in your browser.';
  }
}

export function hasGoogleClientId(): boolean {
  return Boolean(googleClientId);
}
