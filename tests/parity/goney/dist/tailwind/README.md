# glauca-tailwind

The Glauca system as a Tailwind preset: colours, font sizes, spacing, radii.

```js
// tailwind.config.js
const gl = require("glauca-tailwind");
module.exports = {
  theme: {
    extend: {
      colors: gl.colors,
      fontSize: gl.fontSize,
      spacing: gl.spacing,
      borderRadius: gl.borderRadius,
    },
  },
};
```

```html
<h1 class="text-poster text-pruina">Pruina</h1>
<p class="text-caelum">one blue mark</p>
<section class="bg-glaucum-caligo text-pruina p-8">…</section>
```

Colour names: `caelum` (dies default, aer, imum), `glaucum` (caligo, vadum,
spuma, nebula), `pruina`, `charta`, `cinis`, `pix`, `umbra`, `petra`, `ferrum`.
The extended code-tier hues are deliberately not exported: Tailwind is a web
surface, and they belong to code and terminals only. For both modes via
`data-mode`, use the CSS custom properties in `css/glauca.css`.
