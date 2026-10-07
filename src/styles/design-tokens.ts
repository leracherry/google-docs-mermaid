/** Shared Workspace-inspired desktop treatment. Not a private Google Docs API. */
export const geometry = {
  radiusSmall: 8, radiusMedium: 12, radiusLarge: 16, radiusDialog: 28,
  borderWidth: 1, diagramLineWidth: 1.5, iconLineWidth: 2,
  font: "'Google Sans', Roboto, Arial, sans-serif",
  shadow: '0 1px 3px #00000026, 0 2px 6px #00000014',
  dialogShadow: '0 6px 24px #00000026',
  scrim: '#00000052',
};
export const palettes = {
  light: {
    primary: '#0b57d0', onPrimary: '#ffffff', primaryContainer: '#d3e3fd', onPrimaryContainer: '#041e49',
    surface: '#ffffff', surfaceContainer: '#f0f4f9', surfaceContainerLow: '#f8fafd',
    onSurface: '#1f1f1f', onSurfaceVariant: '#444746', outline: '#747775', outlineVariant: '#c4c7c5',
    error: '#b3261e', errorContainer: '#f9dedc', onErrorContainer: '#410e0b',
  },
  dark: {
    primary: '#a8c7fa', onPrimary: '#062e6f', primaryContainer: '#0842a0', onPrimaryContainer: '#d3e3fd',
    surface: '#1f1f1f', surfaceContainer: '#2d2f31', surfaceContainerLow: '#282a2c',
    onSurface: '#e3e3e3', onSurfaceVariant: '#c4c7c5', outline: '#8e918f', outlineVariant: '#444746',
    error: '#f2b8b5', errorContainer: '#601410', onErrorContainer: '#f9dedc',
  },
} as const;
// Tonal blue, green, yellow and red preserve categorical chart meaning.
export const diagramSeries = {
  light: ['#d3e3fd', '#c4eed0', '#fff2c6', '#f9dedc', '#c2e7ff', '#e9ddff'],
  dark: ['#0842a0', '#0f5223', '#5c4300', '#601410', '#004a77', '#4f378b'],
} as const;
export type DesignTheme = keyof typeof palettes;
const kebab = (value: string) => value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
const colors = (theme: DesignTheme) => Object.entries(palettes[theme])
  .map(([name, value]) => `--md-sys-color-${kebab(name)}:${value};`).join('');
export const designTokenCss = `
:root,:host,.light{${colors('light')}
--gdm-font:${geometry.font};
--gdm-radius-small:${geometry.radiusSmall}px;--gdm-radius-medium:${geometry.radiusMedium}px;
--gdm-radius-large:${geometry.radiusLarge}px;--gdm-radius-dialog:${geometry.radiusDialog}px;
--gdm-border-width:${geometry.borderWidth}px;--gdm-icon-line-width:${geometry.iconLineWidth};
--gdm-shadow:${geometry.shadow};--gdm-dialog-shadow:${geometry.dialogShadow};--gdm-scrim:${geometry.scrim};
--gdm-motion:150ms cubic-bezier(.2,0,0,1);color-scheme:light;}
.dark{${colors('dark')}color-scheme:dark;}
`;
