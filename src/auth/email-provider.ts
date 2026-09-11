import type { Locale } from '../i18n/locale.js';

export interface MagicLinkEmail {
  to: string;
  verifyUrl: string;
  expiresAt: number;
  locale: Locale;
}

/**
 * Production delivery is deliberately kept behind this interface. Stage 3 does
 * not configure a vendor or enable outbound authentication email.
 */
export interface MagicLinkEmailProvider {
  readonly id: string;
  sendMagicLink(message: MagicLinkEmail): Promise<void>;
}
