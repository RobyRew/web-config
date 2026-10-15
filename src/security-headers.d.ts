export declare const HEADER_CSP: string;
export declare const PERMISSIONS_POLICY: string;
export declare function securityHeaders(options?: {
  csp?: string | false;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}): Record<string, string>;
