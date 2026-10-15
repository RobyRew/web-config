/** Response security headers for RobyRew apps served by Node (Astro server builds).
 *
 * The same set the static-web nginx image sends (platform/images/static-web/
 * conf/security-headers.conf), for apps that outgrew static files. Plain ESM
 * with no imports, so a bare-Node entry (server.mjs) can load it from
 * node_modules without a build step.
 *
 *     import { securityHeaders } from '@robyrew/web-config/security-headers';
 *     for (const [k, v] of Object.entries(securityHeaders())) res.setHeader(k, v);
 *
 * CSP split: with `security.csp` enabled, Astro writes script-src/style-src
 * (with hashes for its inline island loader) into a <meta> tag on each page.
 * A meta CSP cannot carry frame-ancestors, so the header carries the
 * directives a meta tag cannot, and leaves scripts and styles to the meta.
 * Both policies are enforced; the header must not restrict scripts, or it
 * would block the hashed inline scripts the meta allows.
 */

/** Header-only CSP that complements Astro's per-page <meta> CSP. */
export const HEADER_CSP = "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'";

export const PERMISSIONS_POLICY =
  'camera=(), microphone=(), geolocation=(), payment=(), usb=(), midi=(), interest-cohort=()';

/**
 * @param {{ csp?: string | false, referrerPolicy?: string, permissionsPolicy?: string }} [options]
 *   csp: a full policy for apps without Astro's meta CSP, or false to omit the header.
 * @returns {Record<string, string>}
 */
export function securityHeaders(options = {}) {
  const headers = {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': options.referrerPolicy ?? 'strict-origin-when-cross-origin',
    'Permissions-Policy': options.permissionsPolicy ?? PERMISSIONS_POLICY,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'X-Permitted-Cross-Domain-Policies': 'none',
  };
  if (options.csp !== false) headers['Content-Security-Policy'] = options.csp ?? HEADER_CSP;
  return headers;
}
