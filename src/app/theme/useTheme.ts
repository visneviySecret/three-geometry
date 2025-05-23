import { inject } from "vue";
import type { Theme } from "./theme";

export const useTheme = () => {
  const theme = inject<Theme>("theme");

  return theme;
};
