<template>
    <div class="container play-button">
        <svg class='play-svg' viewBox="0 0 100 100" perserveAspectRatio="XMidYMid" ref="svgEl" @click="onClick">
            <path></path>
            <path></path>
        </svg>
    </div>
</template>

<script setup lang='ts'>

import { defineProps, defineEmits, ref, computed, Ref, watch, onMounted } from 'vue';
import * as d3 from "d3";
import * as Theme from "@/theme";

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    }
});
const emits = defineEmits(['update:modelValue', 'click:play']);

const dData = [
    [
        'M0,0 L50,25 v50 L0,100 Z',
        'M0,0 L30,0 v100 L0,100 Z'
    ],
    [
        'M50,25 v50 L100,50 L100,50 Z',
        'M70,0 v100 L100,100 L100,0 Z'
    ]
]

const playing = ref(false);
const svgEl = ref(null);

watch(() => props.modelValue, (newVal) => {
    playing.value = newVal;
});
watch(playing, (newVal) => {
    d3.select(svgEl.value).selectAll('path').each(function (_, i) {
        d3.select(this).transition().attr('d', dData[i][+newVal])
    });
});

const onClick = () => {
    playing.value = !playing.value;
    emits('click:play');
    setTimeout(() => emits('update:modelValue', playing.value));

}

onMounted(() => {
    d3.select(svgEl.value).selectAll('path').attrHelper({
        'stroke': Theme.Color.majorFontColor,
        'stroke-width': 2,
        'fill': Theme.Color.majorFontColor,
    })
        .each(function (_, i) {
            d3.select(this).attr('d', dData[i][+playing.value])
        });
})

</script>

<style lang="scss" scoped>
.container.play-button {
    cursor: pointer;
    position: relative;

    .play-svg {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        right: 0;
    }

    transition: all 0.2s ease;

    &:hover {
        transform-origin: center;
        transform: scale(1.1);
        filter: drop-shadow(0 0 0.2vh v-bind("Theme.Color.borderLight"));
    }
}
</style>