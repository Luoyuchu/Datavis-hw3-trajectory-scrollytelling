<template>
    <div class="container timelineperson" v-if="singlePersonStore.mode == 0"
        :style="singlePersonStore.mode == 1 ? 'height: 3vh' : 'height: 3.6vh'">
        <div class="event-info" ref="eventInfoEl" v-if="false">
            <div class="event-info__title">
                {{ eventInfoTitle }}
            </div>
            <div v-if="!!playerStore.curEvent" v-for="i in playerStore.curEvent.detail" class="event-info__item">
                {{ i }}
            </div>
        </div>
        <div class="playing-panel" v-if="singlePersonStore.mode == 0">
            <PlayButtonVue class="play-button" v-model="playerStore.playing" @click:play="onPlay()"></PlayButtonVue>
            <input type="range" id="progress-slider" max="100" step="0.1" v-model="playerStore.progress"
                @input="onDragProgressBar($event)" ref="inputRangeEl" />
            <img class="quit-button" src="../assets/svg/quit.svg" @click="onChangeMode(1)" />
        </div>
        <div class="switch" style="display: none">
            <div class="switch__item" :class="{ 'switch__item__alter': singlePersonStore.mode == 0 }"
                @click="onChangeMode(1)">总览模式</div>
            <div class="switch__item" :class="{ 'switch__item__alter': singlePersonStore.mode == 1 }"
                @click="onChangeMode(0)">播放模式</div>
        </div>
    </div>
    <div class='container enter-play-mode' v-else>
        <svg viewBox="0 0 100 100" @click="singlePersonStore.mode = 0">
            <path d="M0,0 v100 L100,50 Z" :fill="Theme.Color.majorFontColor">

            </path>
        </svg>
    </div>
</template>

<script setup lang="ts">
import * as Theme from "@/theme";
import { usePlayerStore } from "@/store/player";
import { useSinglePersonStore } from "@/store/singleperson";
import { onMounted, watch, ref, computed } from "vue";
import PlayButtonVue from "@/widgets/PlayButton.vue";
import gsap from "gsap";


const inputRangeEl = ref(null);
const eventInfoEl = ref(null);
const playerStore = usePlayerStore();
const singlePersonStore = useSinglePersonStore();
const backgroundColor = Theme.Color.borderLight + '30';
const backgroundBoxshadowColor = Theme.Color.majorFontColor + '80';

watch(() => playerStore.curEvent, () => {
    return;
    if (!eventInfoEl.value) return;
    gsap.timeline()
        .fromTo(eventInfoEl.value, {
            // transform: "rotateX(0deg)",
            filter: "blur(0px)",
        },
            {
                // transform: "rotateX(180deg)",
                filter: "blur(5px)",
                duration: 0.1,
            }
        )
        .to(eventInfoEl.value, {
            // transform: "rotateX(0deg)",
            filter: "blur(0px)",
            duration: 0.1,
        });
}, {
    deep: true
});

watch(() => playerStore.progress, (newVal) => {
    if (inputRangeEl.value) {
        const el = inputRangeEl.value;
        const pos = (newVal - el.min) / (el.max - el.min) * 100 + 0.1;
        el.style.background = `linear-gradient(to right, ${Theme.Color.borderLight} 0%, ${Theme.Color.borderLight} ${pos}%, ${Theme.Color.borderLight + "40"} ${pos}%, ${Theme.Color.borderLight + "40"} 100%)`
    }
})


const onChangeMode = (mode: number) => {
    if (singlePersonStore.mode != mode) {
        singlePersonStore.mode = mode;
    }
}

const onPlay = () => {
    if (playerStore.progress === 100) {
        playerStore.progress = 0;
    }
}

const eventInfoTitle = computed(() => {
    if (!playerStore.curEvent) {
        return '';
    }
    const e = playerStore.curEvent;
    let str = '';
    if (e.year instanceof Array) {
        str += `${e.year[0]}年 - ${e.year[1]}年`;
    }
    else {
        str += `${e.year}年`;
    }
    str += ` · ${e.name}`;
    return str;
});

const onDragProgressBar = (): void => {
    playerStore.playing = false;
}

</script>

<style scoped lang="scss">
.container.enter-play-mode {
    height: 2vh;

    svg {
        height: 2vh;
        width: 2vh;
        cursor: pointer;

        &:hover {
            filter: drop-shadow(0 0 0.2vh v-bind("Theme.Color.borderLight"));
        }
    }

}

.container.timelineperson {
    height: 13.6vh;
    // border: 0.2vh solid v-bind("Theme.Color.borderLight");
    border: 0.2vh solid #ba9d82;
    // border-radius: 1vh;
    // background-color: v-bind(backgroundColor);
    // box-shadow: 0.1vh 0.1vh 0.5vh v-bind(backgroundBoxshadowColor);
    padding: 1vh;
    font-family: v-bind("Theme.Font.basicFont");
    color: v-bind("Theme.Color.majorFontColor");
    font-size: 1.5vh;
    background-color: #ffffff70;
    display: flex;
    flex-direction: column;


    .event-info {
        flex: 1 1 autp;
        overflow-y: auto;
        width: 100%;
        margin-bottom: 0.6vh;

        &__title {
            font-weight: 700;
            font-size: 1.7vh;
        }

        &__item {
            width: 90%;
            margin: 0 auto;
        }
    }

    .playing-panel {
        flex: 0 0 auto;
        margin-bottom: 0.6vh;
        margin-top: auto;
        display: flex;
        justify-content: center;
        align-items: center;

        .play-button {
            height: 2vh;
            width: 2vh;
            margin-right: 2vh;
        }

        .quit-button {
            height: 2.1vh;
            width: 2.1vh;
            margin-left: 2vh;
            padding: 0.1vh 0;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
                transform-origin: center;
                transform: scale(1.05);
                filter: drop-shadow(0 0 0.2vh v-bind("Theme.Color.borderLight"));
            }
        }


        #progress-slider {
            -webkit-appearance: none;
            width: 80%;
            cursor: pointer;
            transition: all 450ms ease-in-out;


            &::-webkit-slider-runnable-track {
                -webkit-appearance: none;
                height: 1vh;
            }

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                background: v-bind("Theme.Color.majorFontColor");
                height: 1vh;
                width: 1vh;
                border: black solid 0.1vh;
                cursor: ew-resize;
            }
        }
    }

    .switch {
        flex: 0 0 auto;
        display: flex;
        justify-content: center;

        &__item {
            padding: 0.5vh;
            margin: 0 -0.05vh;
            border: 0.05vh solid v-bind("Theme.Color.majorFontColor");
            box-shadow: inset 0px 0px 2px v-bind(backgroundBoxshadowColor);
            transition: all 0.25s ease;
            cursor: pointer;
            background-color: v-bind('Theme.Color.singleTrajectoryNode');
            color: white;

            &__alter {
                background-color: unset;
                color: v-bind("Theme.Color.majorFontColor");
            }

            &__alter:hover {
                box-shadow: inset 0px 0px 4px v-bind(backgroundBoxshadowColor);
                transform-origin: center;
                transform: scale(0.95);
            }
        }
    }

}
</style>
