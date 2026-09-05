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
 */
export const themeBootstrap = `(function(){try{
var s=localStorage.getItem('theme');
var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-theme', s || (d?'dark':'light'));
var a=localStorage.getItem('accent'); if(a) document.documentElement.setAttribute('data-accent',a);
}catch(e){}finally{
document.documentElement.classList.remove('theme-loading');
document.documentElement.classList.add('js');
}})();`;
