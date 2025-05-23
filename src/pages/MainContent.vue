<template>
  <AppContainer>
    <Title>Three Geometry</Title>
    <SceneContainer>
      <ThreeScene />
    </SceneContainer>
  </AppContainer>
</template>

<script setup lang="ts">
import styled from "vue3-styled-components";
import { useTheme } from "../app/theme/useTheme";
import { ThreeScene } from "@/features/scene3d";
import { AppContainer } from "@/shared/ui/AppContainer";

const theme = useTheme();

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${() => theme.colors.text};
  margin: 0;
`;

const SceneContainer = styled.div`
  width: 100%;
  height: 500px;
  border-radius: ${() => theme.sizes.small};
  overflow: hidden;
  background: ${() => theme.colors.background};
`;
</script>
