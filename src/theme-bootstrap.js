/** The no-flash theme stamp. Inline this in <head> BEFORE any stylesheet:
 *
 *     <script is:inline set:html={themeBootstrap} />
 *
 * It resolves the stored preference (or the OS setting) to a real
 * data-theme="light|dark" on <html> before first paint. Everything downstream —
 * tokens.css, controls.css, the `dark:` variant — keys off that single stamp
 * rather than each re-deriving the theme, so they cannot disagree.
 *
 * Kept as a string because it must run before the bundle: a module import
 * would execute after the first paint, which is the flash it exists to avoid.
 *
 * The source lives in @robyrew/ui (theme.js), beside the tokens it stamps for
 * and the setTheme() runtime that writes the same storage key. Since 0.4.0 the
 * stamp accepts only "light" or "dark" from localStorage.theme (anything else
 * means "follow the system") and keeps an unpinned page in step when the OS
 * appearance changes while the page is open. The string changed, so any CSP
 * hash pinned for it has to be regenerated.
 */
export { themeBootstrap } from '@robyrew/ui/theme.js';
