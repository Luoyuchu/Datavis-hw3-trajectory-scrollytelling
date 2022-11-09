<template>
  <div class="container legend-card-perseon">
    <SemiBorderFrameVue class="semiborder" header-padding="1.3vh">
      <template v-slot:header>
        <div class="semiborder__title">到访地点</div>
      </template>
      <div class="dot-legend legend" ref="dotLegendEl">
        <div class="dot-legend__content">
          <div v-for="idx in [0, 1, 2]" style="display: contents" :key="idx">
            <svg class="dot-legend__glyph"></svg>
            <div class="dot-legend__text">
              <svg viewBox="0 0 100 20" height="2.5vh" width="10vh">
                <text :fill="Theme.Color.majorFontColor" font-size="20" y="1" dominant-baseline="hanging">{{
                    dotLegendLabels[idx]
                }}</text>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </SemiBorderFrameVue>


    <SemiBorderFrameVue class="semiborder semiborder-edge" header-padding="1.3vh">
      <template v-slot:header>
        <div class="semiborder__title">到访轨迹</div>
      </template>
      <div class="edge-legend legend" ref="edgeLegendEl">
        <svg viewBox="0 0 180 100" class="edge-legend__svg" preserveAspectRatio="xMidYMid">
          <defs>
            <linearGradient id="edge-legend-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" :stop-color="Theme.Color.singleTrajectoryEdge[0]" />
              <stop offset="100%" :stop-color="Theme.Color.singleTrajectoryEdge[1]" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" height="15" width="15" :fill="Theme.Color.singleTrajectoryEdge[0]" />
          <rect x="0" y="85" height="15" width="15" :fill="Theme.Color.singleTrajectoryEdge[1]" />
          <rect x="5" y="25" height="50" width="5" fill="url(#edge-legend-gradient)" />
          <path d="M90,7.5 h-60" stroke-width="5" :stroke="Theme.Color.singleTrajectoryEdge[0]" />
          <path d="M90,92.5 h-60" stroke-width="5" :stroke="Theme.Color.singleTrajectoryEdge[1]" />
          <!-- <polygon points="23 7.5, 38 1, 38 14" :fill="Theme.Color.singleTrajectoryEdge[0]" /> -->
          <!-- <polygon points="23 92.5, 38 99, 38 86" :fill="Theme.Color.singleTrajectoryEdge[1]" /> -->
          <text class="label-text">早年轨迹</text>
          <text class="label-text">途经次数</text>
          <text class="label-text">晚年轨迹</text>
          <!-- <circle cx="60" cy="50" r="20" :stroke="Theme.Color.borderLight" stroke-width="1" fill="none" /> -->
          <!-- <path d="M60,30 v-10" :stroke="Theme.Color.majorFontColor" stroke-width="1.5"></path> -->
          <!-- <text font-size="10" x="70" y="25" dominant-baseline="middle">出生</text> -->
          <path d="M30,50 v5 h60 v-12 Z" fill="#806855"></path>
          <text font-size="10" x="30" y="60" dominant-baseline="hanging">1次</text>
        </svg>
      </div>
    </SemiBorderFrameVue>
  </div>
</template>

<script setup lang="ts">

import { useStore } from "vuex";
import SemiBorderFrameVue from "@/components/SemiBorderFrame.vue";
import * as MapDrawer from "@/utils/MapDrawer"
import { Point } from "@/utils/geometry"
import * as Theme from "@/theme";
import * as d3 from "d3";
import { onMounted, ref } from "vue";
import * as Geometry from "@/utils/geometry"
import { svg } from "d3";

const dotLegendEl = ref(null);
const edgeLegendEl = ref(null);

const drawConcentricCirclesGlyph = function (svgG: any, idx: number): void {
  // const strokeWidth = (i) => i === 0 ? 10 : 5;
  // const r = (i) => [5, 50, 90][i];
  // for (let i of d3.range(3).reverse()) {
  //   svgG.append('circle').attrHelper({
  //     "stroke-width": strokeWidth(i),
  //     "stroke": Theme.Color.mapDarkestBrown,
  //     fill: i < 2 ? 'none' : ['none', Theme.Color.singleTrajectoryNode, Theme.Color.singleTrajectoryNodeBlue][idx],
  //     cx: 0,
  //     cy: 0,
  //     r: r(i),
  //   });
  // }
  if (idx === 1) {
    const attrs = {
      fill: [Theme.Color.singleTrajectoryNode, 'none', 'none', Theme.Color.singleTrajectoryNodeBlue][idx],
      stroke: Theme.Color.mapDarkestBrown,
      "stroke-width": 5,
      cx: 0,
    }
    svgG.append('circle').attrHelper({
      ...attrs,
      cy: 0,
      r: 90,
    });
    svgG.append('circle').attrHelper({
      ...attrs,
      cy: 30,
      r: 60,
    });
    svgG.append('circle').attrHelper({
      ...attrs,
      cy: 60,
      r: 30,
    });
  }
  else {
    svgG.append('circle').attrHelper({
      fill: [Theme.Color.singleTrajectoryNode, 'none', 'none', Theme.Color.singleTrajectoryNodeBlue][idx],
      cx: 0,
      cy: 0,
      r: 90,
    });
  }
}

const dotLegendLabels = ['到访', '到访次数', ''];

onMounted(() => {
  const dotLegendSvgs = d3.select(dotLegendEl.value).selectAll('.dot-legend__glyph');
  const edgeLegendSvg = d3.select(edgeLegendEl.value).select(".edge-legend__svg");
  // @ts-expect-error
  dotLegendSvgs.attrHelper({
    viewBox: '-160 -100 320 200',
    perserveAspectRatio: "xMidYMid meet",
  });
  dotLegendSvgs.each(
    function (_, i, e) {
      drawConcentricCirclesGlyph(d3.select(this), i);
    }
  );
  edgeLegendSvg.selectAll("text.label-text")
    .data([10, 50, 90])
    .attrHelper({
      'font-family': Theme.Font.basicFont,
      'font-size': 20,
      "dominant-baseline": "middle",
      fill: Theme.Color.majorFontColor,
      x: 100,
      y: d => d + 2
    });
  // edgeLegendSvg.append('path')
  //   .attrHelper({
  //     d: Geometry.Path.dArc(new Point(60, 50), 20, 0.05, 0.45),
  //     fill: "none",
  //     "stroke-width": 4,
  //     stroke: Theme.Color.singleTrajectoryEdge[1],
  //   });
})

</script>

<style scoped lang="scss">
.container.legend-card-perseon {
  user-select: none;
  padding: 1vh 0 2vh 0;
  color: v-bind('Theme.Color.majorFontColor');
  font-size: 2vh;
  display: flex;

  .semiborder {
    padding: 0;
  }

  .semiborder-edge {
    margin-left: -0.1vh;
  }

  .semiborder__title {
    font-size: 2.5vh;
  }

  .dot-legend {
    width: 9vw;
    display: flex;
    justify-content: center;

    &__content {
      display: grid;
      align-items: center;
      margin: 3.5vh 1vh 1vh 0;
      grid-template-columns: repeat(2, auto);
    }

    &__glyph {
      grid-column: 1;
      height: 1.5em;
      width: 2.5em;
      margin: 0.2em;
    }

    &__text {
      grid-column: 2;
      text-align: left;
    }
  }

  .edge-legend {
    width: 11vw;
    height: 16vh;
    display: flex;
    justify-content: center;
    align-items: center;

    &__svg {
      display: block;
      margin-top: 2vh;
      width: 10vw;
      height: 10vh;
    }
  }
}
</style>

