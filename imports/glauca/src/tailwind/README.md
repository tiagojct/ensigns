# glauca-tailwind

The Glauca system as a Tailwind preset: colours, font sizes, spacing, radii.

```js
// tailwind.config.js
const tw = require("glauca-tailwind");
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
<p class="text-fire">one hot mark</p>
<section class="bg-glaucum-caligo text-pruina p-8">…</section>
```

Colour names: `caelum` (dies default, aer, imum), `glaucum` (caligo, vadum,
spuma, nebula), `pruina`, `charta`, `cinis`, `pix`, `umbra`, `petra`, `ferrum`,
and the code-tier `folium`, `bacca`, `viola`, `lacus`, `unda`. For both modes via
`data-mode`, use the CSS custom properties in `css/glauca.css`.
