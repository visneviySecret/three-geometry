<template>
  <SceneContainer>
    <DoorScene />
    <Frame />
    <ControlsManual />
  </SceneContainer>
</template>

<script setup lang="ts">
import styled from "vue3-styled-components";
import { useTheme } from "../app/theme/useTheme";
import { DoorScene } from "@/features/scene3d";
import { Frame } from "@/widgets/frame";
import { ControlsManual } from "@/widgets/controls-manual";

const theme = useTheme();

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
