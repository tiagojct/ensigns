// Glauca theme for MarkEdit. Feeds the generated Glauca colours (from
// glauca.json, via `make generate`) to MarkEdit-theming's overrideThemes.
// Bundle with `make markedit` (or `npm run build` here) -> dist/markedit/glauca.js.
import { overrideThemes } from 'markedit-theming';
import { light, dark } from './colors.generated.js';

overrideThemes({
  light: { colors: light },
  dark: { colors: dark },
});
