import styled from "vue3-styled-components";
import { useTheme } from "@/app/theme/useTheme";

const theme = useTheme();

export const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: ${() => theme.sizes.medium};
  background: ${() => theme.colors.background};
  padding: ${() => theme.sizes.medium};
`;
