// Mirrors server/css.js so the preview and the live dashboard update instantly.
export const FONTS = {
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  inter: '"Inter", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, Menlo, Consolas, monospace',
  rounded: '"Trebuchet MS", "Segoe UI", sans-serif',
};
export const DENSITY = { compact: 12, comfortable: 18, spacious: 26 };
export const SHADOWS = ['none', '0 1px 3px rgba(0,0,0,.35)', '0 6px 18px rgba(0,0,0,.4)', '0 12px 32px rgba(0,0,0,.5)'];

export const themeVars = (t) => ({
  '--bg': t.bg, '--surface': t.surface, '--border': t.border, '--text': t.text,
  '--muted': t.muted, '--primary': t.primary, '--accent': t.accent,
  '--font': FONTS[t.fontFamily], '--font-size': t.fontSize + 'px', '--radius': t.radius + 'px',
  '--sidebar-w': t.sidebarWidth + 'px', '--gap': DENSITY[t.density] + 'px', '--shadow': SHADOWS[t.shadow],
});
