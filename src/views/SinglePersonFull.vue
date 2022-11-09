<template>
    <div class="container single-person" >
        <div class="view-header backgrounded">
            <img class='lab-logo' src="../assets/logo.svg" />
            <div class="main-title">丁谓行迹图</div>
            <div class="bottom-line"></div>
        </div>
        <div class="map-content backgrounded">
            <MainMap :canvasWidth="toWidth(1)" :canvasHeight="toHeight(1 - 0.083)" scene="single"></MainMap>
            <InfoCardPerson class="info-card"></InfoCardPerson>

        </div>
        <svg width="4.7vw" height="13vh" viewBox="0 0 90 120" ref="chinaSouthSeaLegendEl" class="south-sea-legend"
            preserveAspectRatio="xMidYMid">

        </svg>
        <CopyRightCourse class="copy-right" :canvasWidth="toWidth(0.11)" :canvasHeight="toHeight(0.16 - 0.05)">
        </CopyRightCourse>
        <EventInfoPersonVue class="event-info-person"></EventInfoPersonVue>
        <TimelinePersonVue class="timeline-person"></TimelinePersonVue>
    </div>
</template>

<script setup>
import MainMap from "@/components/map/MainMap.vue";
import InfoCardPerson from "@/components/InfoCardPerson.vue";
import CopyRightCourse from "@/components/CopyRightCourse.vue";
import TimelinePersonVue from "@/components/TimelinePerson.vue";
import EventInfoPersonVue from "@/components/EventInfoPerson.vue";

import { onMounted, ref } from "vue";
import * as Theme from "@/theme";
import * as d3 from "d3";
import * as Layers from "@/components/map/layers";

const chinaSouthSeaLegendEl = ref(null);



const toWidth = (p) => {
    return window.innerWidth * p;
}

const toHeight = (p) => {
    return window.innerHeight * p;
}


onMounted(() => {
    const projection = d3
        .geoMercator()
        .center([106, 23])
        .scale(800)
        .translate([0, 0]);
    const pathDrawer = d3.geoPath(projection);
    const staticContentContainer = d3.select(chinaSouthSeaLegendEl.value).append('g');
    Layers.SouthChinaSeaLegend.register({ projection, pathDrawer, staticContentContainer }).setPos(0, 0, 0.4);
})



</script>
    
<style scoped lang="scss">
.container.single-person {
    height: 100vh;
    width: 100vw;

    .timeline-person {
        width: 50vw;
        position: absolute;
        bottom: 2vh;
        left: 25vw;
    }

    .view-header {
        position: relative;
        height: 8.3vh;
        width: 100vw;
        display: flex;
        align-items: center;
        font-family: FZQINGKBYSJF;
        color: v-bind('Theme.Color.mapDarkBrown');

        .lab-logo {
            margin-left: 2vw;
            display: inline-block;
            width: 4vw;
        }

        .main-title {
            font-size: 4vh;
            margin-left: 1vh;

        }

        .back-button {
            font-size: 2vh;
            padding: 0.5vh;
            border-radius: 0.2vh;
            border: 0.2vh solid #724a2b;
            margin-right: 4vh;
            margin-left: auto;
            flex-grow: 0;
            transition: all 0.2s ease;
            cursor: pointer;

            &:hover {
                transform-origin: center;
                transform: scale(1.1);
                box-shadow: 0 0 5px #724a2b;
            }
        }

        .bottom-line {
            position: absolute;
            bottom: 0vh;
            height: 0vh;
            left: 1.8vw;
            right: 1.8vw;
            border-bottom: 0.3vh solid #724a2b;
        }
    }

    .map-content {
        position: relative;
        width: 100vw;
        height: calc(100vh);

        //max-height: 75.7%;
        .info-card {
            position: absolute;
            top: 0px;
            left: 0px;
            height: calc(100vh - 8.3vh);
        }

        .primary-axis {
            position: absolute;
            top: 0px;
            right: 0px;
        }
    }

    .south-sea-legend {
        position: absolute;
        bottom: 1vh;
        right: 14.8vw;

    }

    .legend-card {
        position: absolute;
        bottom: 0px;
        left: 1vw;
        transform: scale(0.7);
        transform-origin: 0% 100%;
    }

    .copy-right {
        position: absolute;
        bottom: 0px;
        right: 0px;
        width: 13vw;
        height: 14.5vh;
    }

    .event-info-person {
        position: absolute;
        right: 0;
        top: 10vh;
        width: 19vw;
    }
}
</style>
