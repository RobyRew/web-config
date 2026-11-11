# @robyrew/web-config

The settings every RobyRew site was repeating: the strict TypeScript baseline,
the handful of Astro build options, and the Tailwind 4 theme that wires an app
into [`@robyrew/ui`](https://github.com/RobyRew/ui).

It is a config package, not a framework. Each app keeps its own
`astro.config.mjs` and owns its adapter, integrations and routing — only the
parts that were byte-identical across apps live here.

## Install

```
npm i -D github:RobyRew/web-config#v0.4.0
```

`@robyrew/ui` comes with it, so an app does not depend on both.

## TypeScript

```json
{
  "extends": "@robyrew/web-config/tsconfig/base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*", "astro.config.mjs", ".astro/types.d.ts"],
  "exclude": ["dist/", "node_modules/"]
}
```

The baseline is `astro/tsconfigs/strict` plus `noUnusedLocals`,
`noUnusedParameters`, `noImplicitOverride`, `noFallthroughCasesInSwitch` and
`noUncheckedIndexedAccess`. Path aliases stay in the app: they name that app's
own directories.

## Astro

```js
import { defineConfig } from 'astro/config';
import { houseDefaults, localeRouting } from '@robyrew/web-config/astro';

export default defineConfig({
  ...houseDefaults,
  site: 'https://example.com',
  i18n: localeRouting(['en', 'es', 'ca', 'ro'], 'en'),
});
```

`localeRouting` encodes the house locale rule: **the default locale has no URL
prefix.** The site is at `/`, not `/en/`. Routes must come from a rest
parameter — `src/pages/[...lang]/` — because the default locale's value is
`undefined` and a required `[lang]` parameter rejects that. The doc comment on
the function carries the `getStaticPaths` shape that goes with it.

## Theme

```css
@import 'tailwindcss';
@import '@robyrew/web-config/theme.css';
```

That pulls in the glass material and the Apple control set from `@robyrew/ui`
and republishes their tokens as Tailwind theme values, so `bg-panel`,
`text-ink-2`, `border-hair`, `rounded-card` and `shadow-e2` resolve to the same
thing in every app and follow both the theme and the accent.

Since 0.4.0 the theme also maps the status tones (`text-ok`, `text-warn`,
`text-danger`), the text colour for accent fills (`text-on-accent`), the glass
fills (`bg-g-fill`, `bg-g-fill-2`, …), the control fills (`bg-fill`, …), the
glass radii (`rounded-glass-sm`, `rounded-glass`, `rounded-glass-lg`), the small
and large control radii, and two more easings (`ease-spring`,
`ease-house-out` — not `ease-out`, which stays Tailwind's own).

It also defines `.glass-float` (the sticky shell a glass bar sits in, padded
clear of the notch with `viewport-fit=cover`) and the `dark:` variant, which
keys off `data-theme` rather than a media query. `data-theme` can sit on any
element, so the variant stops at a `data-theme="light"` subtree inside a dark
page. A page with a `.glass-float` shell also gets `--rw-toast-offset`, so
`toast()` notices appear below the bar rather than over it. Add
`.rw-scroll-edge` to the shell to fade content into the ground before it passes
under the bar.

The `@robyrew/ui` sheets are imported into Tailwind's `components` layer, so a
Tailwind utility always beats a `.rw-` class — `fixed` on a `.rw-glass` element
wins over the `position: relative` that class needs for its rim. It also means
an app overrides a token by declaring it in its own `:root`; no specificity
gymnastics against `[data-theme="light"]`.

The glass formats' own sheets are not imported here: an Astro page gets each
one with the component that uses it. A page that uses the classes without the
Astro components — a React island, or `toast()` raised from script — adds them
to the same layer:

```css
@import '@robyrew/ui/glass.css' layer(components);
```

## No-flash theme stamp

`theme.css` and the `dark:` variant both read `data-theme` on `<html>`. Stamp it
before the first paint, or the page renders one theme and then swaps:

```astro
---
import { themeBootstrap } from '@robyrew/web-config/theme-bootstrap';
---
<script is:inline set:html={themeBootstrap} />
```

It resolves the stored preference (`localStorage.theme`: `light`, `dark`, or
absent for "follow the system"), falls back to `prefers-color-scheme`, and
carries a stored `accent` across at the same time. One stamp is the single
source of truth for the theme, so the stylesheet and the variant cannot
disagree. While no preference is stored it also follows an OS appearance change
with the page open.

The string itself lives in `@robyrew/ui/theme.js`, next to `setTheme()` and the
other theme helpers; this export is kept so existing imports work. It changed in
0.4.0, so a CSP that pins its hash needs the hash regenerated.

## Security headers (Node-served apps)

Apps that run an Astro server instead of the `static-web` image send the same
header set from Node:

```js
// server.mjs — wraps the @astrojs/node handler
import { securityHeaders } from '@robyrew/web-config/security-headers';

const headers = securityHeaders();
http.createServer((req, res) => {
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  handler(req, res);
});
```

It is plain JavaScript with no imports, so a bare-Node entry can load it from
`node_modules`.

The CSP is split with Astro. Turn on `security.csp` in `astro.config.mjs`, and
Astro writes `script-src`/`style-src` into a `<meta>` tag on every page, with
hashes for its inline island loader. The header carries only what a meta tag
cannot (`frame-ancestors`) plus a few hardening directives, and leaves scripts
and styles to the meta. Both policies are enforced, so the header must not
restrict scripts. For an app without Astro's meta CSP, pass a full policy:
`securityHeaders({ csp: "default-src 'self'; …" })`.

`referrerPolicy` can be overridden per response. For example, use
`no-referrer` on URLs that carry a secret.
