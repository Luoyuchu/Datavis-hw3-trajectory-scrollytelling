<template>
    <div class="container single-person">
        <div class="map-content backgrounded">
            <MainMap :canvasWidth="toWidth(1)" :canvasHeight="toHeight(1)" :storytelling="true"></MainMap>

        </div>
        <LegendCardPersonVue class="legend-card"></LegendCardPersonVue>
    </div>
</template>

<script setup>
import MainMap from "@/components/map/MainMap.vue";
import LegendCardPersonVue from "@/components/LegendCardPerson.vue";

const toWidth = (p) => {
    return window.innerWidth * p;
}

const toHeight = (p) => {
    return window.innerHeight * p;
}
</script>
    
<style scoped lang="scss">
.container.single-person {
    height: 100vh;
    width: 100vw;


    .map-content {
        position: relative;
        width: 100vw;
        height: 100vh;
    }


    .legend-card {
        position: absolute;
        bottom: 0px;
        left: 1vw;
        transform: scale(0.7);
        transform-origin: 0% 100%;
    }
}
</style>
