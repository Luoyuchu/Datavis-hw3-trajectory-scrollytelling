<template>
  <div class="container infocardperson" v-if="ifShow">
    <semi-border-frame class="infocard-head" header-align="left-2vh" footer-align="right-2vh" footer-padding="1.8vh"
      header-padding="1.9vh">
      <template v-slot:header>
        <div class="person-name">
          {{ personTrajectory.name }}
        </div>
      </template>
      <template v-slot:footer>
        <div class="year-range">
          {{ birthDeathFormatter(personTrajectory.lifetime) }}
        </div>
      </template>
      <div class='header-sep'></div>
    </semi-border-frame>


    <div class="birthplace-info">
      <span class="title content first">出生地</span>
      <span class="name content first">{{ birthPlace }}</span>
      <div class="birthplace-sep"></div>
      <span class="title content">常居地</span>
      <span class="name content">{{ majorResidence }}</span>
    </div>


    <div class="trajectory-info" ref="trajectoryInfoEl">
      <div class="trajectory-item" v-for="item in details" :key="item.idx"
        :max-id="getOverviewIdExtent(item.overview)[0]">
        <div class="year" :class="{ 'year--weak': ifAgeWeak(item) }">
          <div class="text">{{ ageFormatter(item.year) }}</div>
          <div class="line"></div>
          <img class="expand" src="../assets/svg/info-expand-arrow.svg"
            :class="{ 'expand-button-rotate': ifExpand(item.idx) }" @click="alterExpand(item.idx)" />
        </div>
        <div class="overview">
          <span class="overview__item" v-for="oItem in item.overview "
            :class="{ 'overview__item--weak': ifOverviewItemWeak(oItem) }" :key="oItem.id">
            <span @click="onOverviewItemClick(oItem)" class="overview__item__place">{{ overviewItemFormatter(oItem,
                item.overview)[0]
            }}</span>
            <span>{{ overviewItemFormatter(oItem, item.overview)[1] }}</span>
          </span>
        </div>
        <transition name="expandHeight">
          <div class="detail" v-if="ifExpand(item.idx)">
            <p class="detail__item" v-for="(ditem, index) in item.detail" :key="index">
              {{ ditem }}
            </p>
          </div>
        </transition>
      </div>
    </div>


    <LegendCardPerson class="legend-card"></LegendCardPerson>
  </div>
</template>


<script setup lang="ts">
import SemiBorderFrame from "@/components/SemiBorderFrame.vue";
import LegendCardPerson from "@/components/LegendCardPerson.vue";
import { ref, computed, onMounted, watch } from "vue";
import * as Data from "@/data";
import { useStore } from "vuex";
import * as d3 from "d3";
import lodash from "lodash";
import * as Theme from "@/theme";
import { useSinglePersonStore } from "@/store/singleperson";
import { usePlayerStore } from "@/store/player";

interface overviewItemType {
  name: string,
  id: number,
};


const expandState = ref(new Map());
const store = useStore();
const singlePersonStore = useSinglePersonStore();
const playerStore = usePlayerStore();
const trajectoryInfoEl = ref(null);
const personTrajectory = computed(() => store.state.singlePersonData);
const ifShow = computed(() => {
  return !!personTrajectory.value;
})
const ifExpand = (idx: number): boolean => {
  return expandState.value.has(idx) && expandState.value.get(idx);
}
const alterExpand = (idx: number): void => {
  expandState.value.set(idx, !ifExpand(idx));
}
const getOverviewIdExtent = (overview: Array<overviewItemType>): [number, number] => {
  const r = d3.extent(overview.map(d => d.id));
  return [+r[0], +r[1]];
}
const ifAgeWeak = (item) => {
  if (singlePersonStore.mode === 0 && getOverviewIdExtent(item.overview)[0] > playerStore.passedEdgeId) {
    return true;
  }
  return false;
}
const ifOverviewItemWeak = (item: overviewItemType) => {
  if (singlePersonStore.mode === 0 && item.id > playerStore.passedEdgeId) {
    return true;
  }
  return false;
}

const onOverviewItemClick = (item: overviewItemType) => {
  const oldIdx = singlePersonStore.placeInfoClickEvent[1];
  singlePersonStore.placeInfoClickEvent = [item.id, oldIdx + 1];
};

const yearFormatter = (y: number): string => {
  if (y === null) {
    return "不详"
  }
  else if (y > 0) {
    return "公元" + y.toString();
  }
  else {
    return '公元前' + (-y).toString()
  }
}

const birthPlace = computed(() => {
  if (personTrajectory.value.lifetime[0] && personTrajectory.value.trajectory[0].time[0] === personTrajectory.value.lifetime[0]) {
    return personTrajectory.value.trajectory[0].name;
  }
  return '不详';
})

const birthDeathFormatter = (ys: [number, number]): string => {
  const a = yearFormatter(ys[0]);
  const b = yearFormatter(ys[1]);
  if (a === b && a === '不详') {
    return a;
  }
  else {
    return a + ' - ' + b;
  }
}

const ageFormatter = (age: [number, number]): string => {
  if (age[0] === 0) {
    return `出生 - ${age[1]}岁`;
  }
  else {
    return `${age[0]} - ${age[1]}岁`;
  }
}


const overviewItemFormatter = (d: overviewItemType, da: Array<overviewItemType>): [string, string] => {
  if (d === da[da.length - 1]) {
    return [d.name, ""];
  }
  else {
    return [d.name, " → "];
  }
}

const majorResidence = computed(() => {
  const cnt = {};
  for (let i of personTrajectory.value.trajectory) {
    if (!(i.name in cnt)) {
      cnt[i.name] = 0;
    }
    // cnt[i.name] += i.time[1] - i.time[0];
    cnt[i.name] += 1;
  }
  const candidate = Object.entries(cnt) as [string, number][];
  const idx = d3.maxIndex(candidate, d => d[1]);
  return candidate[idx][0];
});

const details = computed(() => {
  console.log(personTrajectory);
  let r = [];
  let idx = 0;
  let birthTime = personTrajectory.value.lifetime[0];
  for (let i of personTrajectory.value.trajectory) {
    const year = (i.year instanceof (Array)) ? [+i.year[0] - birthTime, +i.year[1] - birthTime] : [+i.year - birthTime, +i.year - birthTime];
    const detail = lodash.cloneDeep(i.detail);
    const overview = [{
      name: i.name,
      id: i.id
    }
    ];
    const last = r.length > 0 ? r[r.length - 1] : null;
    if (last && +last.year[1] + 1 >= +year[0] && (year[0] === year[1] || last.year[0] == last.year[1])) {
      last.overview = last.overview.concat(overview);
      last.detail = last.detail.concat(detail);
    }
    else {
      r.push({
        idx, year, overview, detail
      })
      idx += 1;
    }
  }
  return r;
})

watch(() => playerStore.passedEdgeId, (newVal) => {
  if (trajectoryInfoEl.value && singlePersonStore.mode === 0) {
    const centerH = trajectoryInfoEl.value.clientHeight / 2;
    let s = 0;
    for (let el of trajectoryInfoEl.value.querySelectorAll(".trajectory-item")) {
      const maxId = +el.getAttribute("max-id");
      if (maxId >= newVal) {
        s = Math.max(0, s - centerH);
        trajectoryInfoEl.value.scrollTo({ top: s, behavior: 'smooth' });
        return;
      }
      else {
        s += el.scrollHeight;
      }
    }
  }
})

onMounted(() => {
  expandState.value.clear();
})

</script>

<style scoped lang="scss">
.container.infocardperson {
  font-family: FZQINGKBYSJF;
  color: #5a3a20;
  text-align: left;
  padding-left: 1.5vw;
  padding-top: 1vh;
  padding-right: 1vw;
  padding-bottom: 30vh;
  width: 20vw;
  display: flex;
  flex-direction: column;

  background: rgba(255, 255, 255, 0.5);

  .infocard-head {
    flex: 0 0 auto;
  }

  .person-name {
    font-size: 3.5vh;
  }

  .header-sep {
    height: 8vh;
  }

  .year-range {
    font-size: 2.5vh;

    span {
      font-size: 2.5vh;
    }
  }

  .birthplace-info {
    flex: 0 0 auto;
    margin-top: 1vh;
    font-size: 2.3vh;
    border: solid #5a3a20 0.1vh;
    display: grid;
    grid-template-columns: max-content auto;
    padding: 0.6vh;

    .content {
      margin: 0.3vh auto 0.3vh;
    }

    .birthplace-sep {
      grid-column: 1 / 3;
      border-top: solid #5a3a20 0.1vh;
      height: 0.3vh;
      margin-top: 0.3vh;
    }

    .title {
      padding-right: 0.6vh;
      border-right: solid #5a3a20 0.1vh;
      margin-left: 0;
      margin-right: 0;
    }

    .name {
      margin-right: 0.3vh;
      margin-left: auto;
      padding-right: 0.6vh;
    }
  }

  .trajectory-info {
    margin-top: 1vh;
    overflow-y: auto;
    font-size: 1.8vh;
    font-family: none;
    flex: 1 1 auto;

    .trajectory-item {
      margin: 0.2em;
      margin-right: 0.5em;

      &>.year {
        margin: 0.25em 0;
        display: flex;

        &--weak {
          color: v-bind("Theme.Color.majorFontColor + '80'");
        }

        &>.text {
          text-align: left;
          margin-left: 0.2em;
          margin-right: 0.2em;

        }

        .line {
          flex-grow: 1;
          height: 0.01vh;
          margin: 0.5em 0.5em 0.5em 0.1em;
          border-top: solid currentColor 0.2vh;
        }

        .expand {
          height: 1em;
          width: 1em;
          margin-right: 0.1em;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            filter: drop-shadow(0px 0px 5vh #5a3a20) brightness(2);
          }
        }

        .expand-button-rotate {
          transform: rotate(45deg);
        }
      }

      &>.overview {
        font-size: 1.5vh;
        margin: 0.2em;
        font-weight: 700;

        .overview__item__place {
          cursor: pointer;

          &:hover {
            filter: drop-shadow(0px 0px 0.05vh #5a3a2080);
          }
        }

        .overview__item--weak {
          color: v-bind("Theme.Color.majorFontColor + '80'");
          font-weight: 500;
        }
      }

      &>.detail {
        font-size: 1.5vh;
        max-height: 10vh;
        overflow-y: auto;

        .detail__item {
          text-indent: 0.2em;
        }
      }

    }

  }

  .legend-card {
    flex: 0 0 auto;
    margin-top: auto;
  }

  .expandHeight-enter-active,
  .expandHeight-leave-active {
    transition: all 0.3s ease-out;
  }

  .expandHeight-enter-from,
  .expandHeight-leave-to {
    opacity: 0;
    max-height: 0px !important;
  }
}
</style>
