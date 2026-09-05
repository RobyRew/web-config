# @robyrew/web-config

The settings every RobyRew site was repeating: the strict TypeScript baseline,
the handful of Astro build options, and the Tailwind 4 theme that wires an app
into [`@robyrew/ui`](https://github.com/RobyRew/ui).

It is a config package, not a framework. Each app keeps its own
`astro.config.mjs` and owns its adapter, integrations and routing — only the
parts that were byte-identical across apps live here.

## Install

```
npm i -D github:RobyRew/web-config#v0.1.0
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

It also defines `.glass-float` (the sticky shell a glass bar sits in) and the
`dark:` variant, which keys off `data-theme` rather than a media query.

The `@robyrew/ui` sheets are imported into Tailwind's `components` layer, so a
Tailwind utility always beats a `.rw-` class — `fixed` on a `.rw-glass` element
wins over the `position: relative` that class needs for its rim. It also means
an app overrides a token by declaring it in its own `:root`; no specificity
gymnastics against `:root[data-theme="light"]`.

## No-flash theme stamp

`theme.css` and the `dark:` variant both read `data-theme` on `<html>`. Stamp it
before the first paint, or the page renders one theme and then swaps:

```astro
---
import { themeBootstrap } from '@robyrew/web-config/theme-bootstrap';
---
<script is:inline set:html={themeBootstrap} />
```

It resolves the stored preference, falls back to `prefers-color-scheme`, and
carries a stored `accent` across at the same time. One stamp is the single
source of truth for the theme, so the stylesheet and the variant cannot
disagree.
