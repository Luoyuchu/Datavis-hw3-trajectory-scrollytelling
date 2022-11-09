<template>
    <div class="container copyright">
        <SemiBorderFrameVue header-padding="1.2vh">
            <template v-slot:header>
                <div class="head-title">页面说明</div>
            </template>
            <div class="content">
                <svg class="content__svg" ref="svgEl">
                    <text class="t">北京大学2022秋季课程</text>
                    <text class="t" font-size="12"><a href="http://vis.pku.edu.cn/course/datavis_f22">
                            <tspan style="fill: darkblue" dy="" dx="-3"> 《数据可视化》 </tspan>
                        </a></text>
                    <text class="t">
                        作业三 · 轨迹数据故事叙述
                    </text>

                    <path d="M0,75 h200" :stroke="Theme.Color.majorFontColor" stroke-width="1"></path>
                    <text class="t" font-size="10">北京大学可视化与可视分析实验室</text>
                </svg>
            </div>
        </SemiBorderFrameVue>
    </div>
</template>

<script setup lang="ts">
import SemiBorderFrameVue from "@/components/SemiBorderFrame.vue";
import { onMounted, ref, defineProps } from "vue";
import * as d3 from "d3";
import * as Theme from "@/theme";


const props = defineProps(['canvasWidth', 'canvasHeight']);
const svgEl = ref(null);

onMounted(() => {
    const svg = d3.select(svgEl.value);
    const texts = svg.selectAll(".t");
    svg.attrHelper({
        width: props.canvasWidth,
        height: props.canvasHeight,
        viewBox: "0 0 200 100",
    })
    texts.attrHelper({
        "font-family": Theme.Font.basicFont,
        "dominant-baseline": "hanging",
        "font-size": 12,
    });
    texts.each((d, i, es) => {
        const e = d3.select(es[i]);
        e.attrHelper({
            "y": 20 * i + 15,
        });
        if (i === 3) {
            e.attr("font-size", 10);
            e.attr("dy", 10);
        }
    })
});
</script>

<style scoped lang="scss">
.container.copyright {
    font-family: FZQINGKBYSJF;
    color: #5a3a20;
    text-align: left;
    padding: 1.2vh 1vw 1vh 1vw;
    font-size: 1vh;
    background: rgba(255, 255, 255, 0.5);


    .head-title {
        font-size: 2vh;
    }

    .content {
        margin: 1vh auto 0.5vh;
        padding: 0.4vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
