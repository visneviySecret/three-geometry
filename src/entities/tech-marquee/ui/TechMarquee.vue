<script setup lang="ts">
import { ref, onMounted } from "vue";
import styled from "vue3-styled-components";
import packageJson from "../../../../package.json";

const technologies = ref<string[]>([]);

onMounted(() => {
  // Получаем все зависимости из package.json
  const deps = Object.keys(packageJson.dependencies || {});
  const devDeps = Object.keys(packageJson.devDependencies || {});

  // Объединяем зависимости и форматируем их
  technologies.value = [...deps, ...devDeps].map((tech) => {
    // Удаляем @ и все что после / в названиях пакетов
    return tech.replace(/@[^/]+\//, "").replace(/^@/, "");
  });
});

const MarqueeContainer = styled.div`
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  background: #1a1a1a;
  overflow: hidden;
  padding: 12px 0;
  display: flex;
  align-items: center;
`;

const StaticLabel = styled.span`
  color: #4caf50;
  font-size: 1.2rem;
  font-family: monospace;
  padding-inline: 20px;
  font-weight: bold;
  z-index: 1;
`;

const MarqueeWrapper = styled.div`
  position: relative;
  flex-grow: 1;
  overflow: hidden;
`;

const MarqueeContent = styled.div`
  display: inline-block;
  white-space: nowrap;
  animation: marquee 30s linear infinite;
  padding-left: 100%;

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }
`;

const TechItem = styled.span`
  color: #4caf50;
  font-size: 1.2rem;
  margin: 0 20px;
  font-family: monospace;

  &:after {
    content: "🚀";
    margin-left: 8px;
  }
`;
</script>

<template>
  <MarqueeContainer>
    <StaticLabel>Stack: </StaticLabel>
    <MarqueeWrapper>
      <MarqueeContent>
        <TechItem v-for="tech in technologies" :key="tech">
          {{ tech }}
        </TechItem>
      </MarqueeContent>
    </MarqueeWrapper>
  </MarqueeContainer>
</template>
