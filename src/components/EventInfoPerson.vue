<template>
    <div class="container event-info-person">
        <SemiBorderFrameVue header-padding="1.2vh">
            <template v-slot:header>
                <div class="head-title">轨迹详情</div>
            </template>
            <div class="content" ref="contentEl">
                <div class="detail-item" v-for="item in detailList" ref="itemEls" @click="onItemClick(item[0].id)"
                    :key="item[0].id" :event-id="item[0].id"
                    :class="{ 'detail-item--current': item[0].id === playerStore.curEdgeId }">
                    <div class="detail-item__header">
                        <span class="detail-item__header__year">{{ formatYearStr(item[0].year) }}</span>
                        <span class="detail-item__header__place">{{ item[0].name }}</span>
                    </div>
                    {{ item[1] }}
                </div>
            </div>
        </SemiBorderFrameVue>
    </div>
</template>

<script setup lang="ts">
import lodash from "lodash";
import * as Theme from "@/theme";
import { ref, computed, watch, onMounted } from "vue";
import { useSinglePersonStore } from "@/store/singleperson";
import { usePlayerStore } from "@/store/player";
import SemiBorderFrameVue from "@/components/SemiBorderFrame.vue";


const itemEls = ref([]);
const contentEl = ref(null);
const singlePersonStore = useSinglePersonStore();
const playerStore = usePlayerStore();

const detailList = computed(() => {
    if (!singlePersonStore.trajectoriesInfo) return [];
    return singlePersonStore.trajectoriesInfo.map(d => {
        const r = lodash.cloneDeep(d);
        let dstr = '';
        if (r.detail.length > 0) {
            if (r.detail instanceof Array) {
                dstr = r.detail.join('\n')
            }
            else {
                dstr = r.detail;
            }

        }
        else if (r.name) {
            dstr = '至' + r.name;
        }
        else {
            dstr = '不详';
        }
        return [r, dstr];
    })
});

const formatYearStr = (year): string => {
    if (year instanceof (Array)) {
        return `${year[0]} - ${year[1]}年`;
    }
    else {
        return `${year}年`;
    }
}

const onItemClick = (id) => {
    const oldIdx = singlePersonStore.placeInfoClickEvent[1];
    singlePersonStore.placeInfoClickEvent = [id, oldIdx + 1];
}

watch(() => playerStore.curEdgeId, (newVal) => {
    if (newVal === -1) {
        return;
    }
    const els = contentEl.value.querySelectorAll(".detail-item")
    let s = 0;
    for (let e of els) {
        const id = +e.getAttribute("event-id");
        if (id === newVal) {
            contentEl.value.scrollTo({ top: s, behavior: 'smooth' });
            return;
        }
        else {
            s += e.scrollHeight;
        }
    }
})


</script>

<style scoped lang="scss">
.container.event-info-person {
    margin: 0 1vw;
    background: rgba(255, 255, 255, 0.5);


    .head-title {
        font-size: 2vh;
    }

    .content {
        margin: 3vh 0.1vw 1vh;
        padding: 0 0.3vw;
        max-height: 58vh;
        overflow-y: auto;
        text-align: start;
        font-size: 1.3vh;
        line-height: 1.5;
        color: v-bind("Theme.Color.majorFontColor + 'B0'");

        .detail-item {
            padding-bottom: 0.5vh;
            padding-top: 0.5vh;
            border-bottom: solid 0.1vh v-bind("Theme.Color.borderLight");
            border-top: solid 0.1vh v-bind("Theme.Color.borderLight");
            cursor: pointer;
            transition: all 0.1s ease;

            &:hover {
                background-color: v-bind("Theme.Color.borderLight + '40'");
            }

            &__header {
                font-size: 2vh;
                display: flex;
                padding-right: 0.3vw;

                &__place {
                    margin-left: auto;
                }
            }

            &--current {
                color: v-bind("Theme.Color.majorFontColor");

                .detail-item__header {
                    font-weight: 700;
                }
            }

        }
    }
}
</style>