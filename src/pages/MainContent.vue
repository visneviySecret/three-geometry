<template>
  <SceneContainer>
    <Title>Three Geometry</Title>
    <DoorScene />
  </SceneContainer>
</template>

<script setup lang="ts">
import styled from "vue3-styled-components";
import { useTheme } from "../app/theme/useTheme";
import { DoorScene } from "@/features/scene3d";

const theme = useTheme();

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${() => theme.colors.text};
  margin: 0;
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1;
`;

const SceneContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: ${() => theme.colors.background};
`;
</script>
