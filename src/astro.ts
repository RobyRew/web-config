/** House defaults for an Astro app.
 *
 *     import { houseDefaults } from '@robyrew/web-config/astro';
 *     export default defineConfig({ ...houseDefaults, site, output: 'server' });
 *
 * Deliberately an object to spread, not a factory that returns a whole config.
 * The apps differ in the ways that matter — static vs. server, adapters,
 * integrations, whether they use Astro's i18n router at all — so a factory
 * would spend its life being worked around. This is only the handful of
 * settings that were byte-identical across the apps.
 */
export const houseDefaults = {
  /** A URL means the same page with or without its trailing slash. */
  trailingSlash: 'ignore',
  compressHTML: true,
  build: {
    /** Small sheets inline; large ones stay a cacheable file. */
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
} as const;

/** Astro's i18n block for the house locale rule: the DEFAULT LOCALE HAS NO URL
 *  PREFIX. The site is at `/`, never `/en/`; other locales keep theirs.
 *
 * `prefixDefaultLocale: false` alone does not achieve this. Routes have to come
 * from a REST parameter — `src/pages/[...lang]/` — because the default locale's
 * value is `undefined` and Astro rejects an undefined value for the required
 * parameter that `[lang]` declares ("Missing parameter: lang"). getStaticPaths
 * then maps the default locale to `undefined`:
 *
 *     export function getStaticPaths() {
 *       return LOCALES.map((lang) => ({
 *         params: { lang: lang === DEFAULT ? undefined : lang },
 *       }));
 *     }
 *
 * No `fallback`: with one route per locale already emitted, fallback makes Astro
 * also mirror the default locale's pages into the others, which collides with
 * the real routes and fills the build log with priority warnings.
 */
export function localeRouting<T extends string>(locales: readonly T[], defaultLocale: T) {
  return {
    locales: [...locales],
    defaultLocale,
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  };
}
