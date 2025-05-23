import { inject } from "vue";
import { theme } from "./theme";
import type { Theme } from "./theme";

export const useTheme = (): Theme => {
  const injectedTheme = inject<Theme>("theme");

  if (!injectedTheme) {
    return theme;
  }

  return injectedTheme;
};
