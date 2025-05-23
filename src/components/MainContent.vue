<template>
  <AppContainer>
    <Title>Three Geometry</Title>
  </AppContainer>
</template>

<script setup lang="ts">
import styled from "vue3-styled-components";
import { useTheme } from "../theme/useTheme";

const theme = useTheme();

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${() => theme.sizes.medium};
  background: ${() => theme.colors.background};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${() => theme.colors.text};
`;
</script>
