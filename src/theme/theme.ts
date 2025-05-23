export const theme = {
  colors: {
    primary: "#646CFF",
    secondary: "#42b883",
    background: "var(--bg-color)",
    text: "var(--text-color)",
  },
  sizes: {
    small: "0.5rem",
    medium: "1rem",
    large: "2rem",
  },
  breakpoints: {
    mobile: "320px",
    tablet: "768px",
    desktop: "1024px",
  },
} as const;

// Типы для темы
export type Theme = typeof theme;
export type ThemeColors = keyof typeof theme.colors;
export type ThemeSizes = keyof typeof theme.sizes;
