<template>
    <div class="container story-main" ref="storyMain">
        <!-- 背景的轨迹可视化 -->
        <SinglePersonVue class='story-map'></SinglePersonVue>
        <!-- 故事内容 -->
        <div class="story-content">
            <!-- 滚动层，该div会随着滚动而滚动，像一条传送带，放在上面的内容将被带着向屏幕上方走 -->
            <div class="scroll-belt" :style="{ height: `${scrollScreenNum * 100}vh` }">
                <!-- 标尺，方便编排动画时定位，完成编排后请注释或删去该div -->
                <!-- <div class="ruler" v-for="i in d3.range(1, scrollScreenNum * 10 - 1)" :style="{ top: i * 10 + 'vh' }"
                    :key="i" style="position: absolute; border-top: solid 2px black; right: 0; ">{{ i * 10 }}vh
                </div> -->

                <!-- 
                    第一幕：
                 -->
                <div class="scrollystory-box" data-aos="fade-right" style="width: 40vw; top: 100vh; right: 5vw;">
                    <h1 style="font-size: 5vh">丁谓</h1>
                    <div style="margin: 2vh 0; border-top: 1px #5a3a20 solid"></div>
                    <h3>丁谓（966年－1037年），字谓之，后更字公言，北宋时期苏州长州（今江苏苏州）人。</h3>
                    <p style="font-size: 2vh; margin-top: 2vh;">
                        淳化三年（992年）进士，授大理寺评事、通判饶州事。累官至枢密使、同中书门下平章事、封晋国公。拜相后极力排斥寇准。仁宗即位后为真宗山陵使，坐与内侍勾结，贬崖州司户参军，徒雷州。后以秘书省监致仕，居光州。景祐四年（1037年），卒。善言谈，喜欢作诗，于图书、博奕、音律无一不精。为人机智多敏，善揣摩人意。真宗朝兴建宫观，大兴祥异，与王钦若难辞其咎。其人其事不足称，而以诗文有声于后世。其四六文言辞婉约，尤工诗词，尝参预西昆派诗人唱酬，风格不全与西昆体相同。
                    </p>
                </div>

                <div class="scrollystory-box" data-aos="fade-right"
                    style="top: 150vh; right: 5vw; text-align: center; font-size: 2.5vh; padding: 4vh 4vh;">
                    <p style="text-align: left; margin-bottom: 1vh;"><i>丁谓的诗...</i></p>
                    <h2>《海》</h2>
                    <h4>丁谓</h4>
                    <p>积润容零露，无涯任酌蠡。</p>
                    <p>浮空长浴日，表圣不扬波。</p>
                    <p>江汉源流众，蕃夷岛屿多。</p>
                    <p>客槎如可泛，咫尺是星河。</p>
                </div>

                <div style="position: absolute; top: 120vh; left: 5vw;" data-aos="fade-left">
                    <img src="/picture_dingwei.jpg" style="object-fit: contain; width: 30vw; height: 30vh;" />
                </div>

                <!-- 
                    第二幕：出生
                 -->
                <div class="scrollystory-box" style="width: 40vw; top: 220vh; right: 5vw;">
                    <h2>丁谓的出生</h2>
                    <p style="font-size: 2vh; margin-top: 2vh;">
                        丁谓出生于宋太宗至道二年（公元966年），苏州长州（今天江苏苏州）人，幼时家境贫寒。
                    </p>
                </div>

                <!--
                    第三幕：受人帮助与考取功名
                  -->
                <div class="scrollystory-box" style="width: 35vw; padding: 2em; top: 300vh; left: 5vw"
                    data-aos="zoom-in-left">
                    <h4 style="margin-bottom: 1vh;">994年，丁谓在鄱阳考取功名，进士及第，名在第四。</h4>
                    <p><i>胡则是丁谓的同乡，年龄比丁谓稍大，考取功名的时间也比丁谓稍早。丁谓在鄱阳考取功名之前，胡则帮助过丁谓...</i></p>
                    <h2>胡则接济丁谓的故事</h2>
                    <video style=" object-fit: contain; margin: auto; margin-top: 1vh; max-width: 100%;" controls>
                        <source src="/video_huze_dingwei.mp4" type="video/mp4" />
                    </video>
                </div>

                <!-- 
                    第五幕：社交网络
                 -->
                <div class="scrollystory-box" style="width: 40vw; top: 570vh; left: 50vw;" data-aos="fade-left">
                    <h2 style="text-align: center; margin-bottom: 2vh;">丁谓的社交网络</h2>
                    <div style="width: 100%; height: 50vh;">
                        <ForceDirectedGraphVue></ForceDirectedGraphVue>
                    </div>
                    <p style="font-size: 2vh; margin-top: 2vh;">
                        丁谓的社交网络关系复杂，其为人机智多敏，善揣摩人意，与许多人关系要好，但又有才无德，也有许多敌人。</p>
                </div>

                <!-- 
                    第六幕：逝世
                 -->
                <div class="scrollystory-box" style="width: 35vw; padding: 2em; top: 700vh; left: 5vw">
                    <h2 style="margin-bottom: 1vh;">1037年4月, 丁谓居光州，四月于卧佛堂中去世。</h2>
                </div>

            </div>

            <!-- 该div不会随着故事场景滚动而滚动，放置在上面的内容默认状态下与屏幕保持静止，我们使用Javascript手动为上面的内容编写动画 -->
            <div class="scroll-static">

                <!-- 第零幕，封面 -->
                <div id="preface" ref="prefaceRef"
                    style="position: fixed; top: 0; height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center;">
                    <div class="scrollystory-box" style="text-align: center">
                        <div style="font-size: 5vh; ">中国古代名人行迹</div>
                        <div style="font-size: 10vh; margin: 2vh">北宋“五鬼”——<b>丁谓</b></div>
                        <div style="font-size: 3vh; margin-bottom: 1vh;"> 宋太宗至道二年 至 宋仁宗景祐四年</div>
                        <div style="font-size: 2.5vh; margin-bottom: 1vh;">(996年-1037年)</div>
                        <div><i>*Datavisf22作业示例，内容不保证完全正确</i></div>
                    </div>
                </div>

                <!-- 
                第四幕：游历全国
                请向下滚动
                -->
                <div ref="scrollPlsRef"
                    style="position: fixed; top: -100vh; height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center;">
                    <div class="scrollystory-box" style="text-align: center">
                        <h1 style="margin-bottom: 1vh">丁谓走上了仕途，他因为职务调动到访各地，广交好友！</h1>
                        <h4>↓↓↓请继续向下滚动↓↓↓</h4>
                    </div>
                </div>

                <!-- 
                落幕：自由探索
                支持自由探索的轨迹可视化（作业一中展示的）
                -->
                <div ref="exploreMapRef"
                    style="height: 100vh; width: 100vw; position: fixed; top: 100vh; pointer-events: auto;">
                    <SginlePersonFullVue style="height: 100vh; width: 100vw;">
                    </SginlePersonFullVue>
                    <ElButton @click="exploreMapOnClick"
                        style="position: absolute; top: 2vh; left: 40vw; width: 20vw; font-size: 2vh; height: 5vh; color: #5a3a20;">
                        <b>返回故事</b>
                    </ElButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/* 全局变量与状态管理 */
import { usePlayerStore } from "../store/player";
import { useSinglePersonStore } from "../store/singleperson";
import { useGlobalScrollController } from "../composable/globalScrollController";
import { getCurrentLodGraph } from "../store/mapController";
/* Vue*/
import { onMounted, ref, watch, computed } from "vue";
/* 按钮组件 */
import { ElButton } from "element-plus";
/* 组件 */
import SinglePersonVue from "./SinglePerson.vue";
import SginlePersonFullVue from "./SinglePersonFull.vue"
import ForceDirectedGraphVue from "../userdefine/ForceDirectedGraph.vue";
// 数据
import * as Data from "../data";
// 地图图层
import * as Layers from "../components/map/layers"
/* 第三方库*/
import * as d3 from "d3";
import AOS from "../library/aos";

/*注册全局状态管理组件*/
const playerStore = usePlayerStore();
const singlePersonStore = useSinglePersonStore();
const scrollController = useGlobalScrollController();
/*加载数据*/
singlePersonStore.personData = Data.Poet.getData();

/**
 * 设置滚动层总长度
 * 默认20sc
 */
const scrollScreenNum = ref(8);
const scrollHeightPx = computed(() => {
    return scrollScreenNum.value * window.innerHeight;
})


/*
 * 轨迹动画编排
 * domain: 滚动高度区间
 * range: 映射到的轨迹区间
 * cameraCenter: 画面中心在屏幕的位置
 * scaleCompensation：镜头缩放倍数补偿
 */
const trajectoryAnimation = [
    {
        domain: [1.6, 2.2],
        range: [0, 0],
        cameraCenter: [0.25, 0.5],
        scaleCompensation: 2,
    },
    {
        domain: [2.2, 3.1],
        range: [0, 1],
        cameraCenter: [0.7, 0.5],
        scaleCompensation: 2,
    },
    {
        domain: [3.4, 5],
        range: [1, 20],
        scaleCompensation: 0.9,
    },
    {
        domain: [6.2, 6.9],
        range: [32, 32],
    }
];
/* 
 * 轨迹动画控制函数（请谨慎修改）
 * 计算滚动高度到轨迹播放进度的映射
*/
let isProgressCalced = false;
function trajectoryAnimationCheck(offset: number) {
    if (!isProgressCalced) {
        if (getCurrentLodGraph().timelineLabels) {
            isProgressCalced = true;
            for (let i of trajectoryAnimation) {
                const range = i.range;
                const endProgress = getCurrentLodGraph().getLabelProgress(range[1], true);
                const startProgress = range[0] === range[1] ? endProgress : getCurrentLodGraph().getLabelProgress(range[0] + 1, false);
                i.progress = [startProgress, endProgress];
            }
            playerStore.progress = 0;
            getCurrentLodGraph().cleanAnimation();
        }
    }
    else {
        let flag = false;
        for (let i of trajectoryAnimation) {
            const domain = i.domain;
            if (offset >= domain[0] * window.innerHeight && offset < domain[1] * window.innerHeight) {
                const progress = i.progress;
                const currentProgress = progress[0] + (progress[1] - progress[0]) / (domain[1] - domain[0]) * (offset / window.innerHeight - domain[0]);
                playerStore.progress = currentProgress * 100;
                singlePersonStore.canvasCenter = i.cameraCenter ?? [0.5, 0.5];
                singlePersonStore.scaleCompensation = i.scaleCompensation ?? 1;
                flag = true;
                break;
            }
        }
        if (!flag) {
            singlePersonStore.canvasCenter = [0.5, 0.5];
            singlePersonStore.scaleCompensation = 1;
        }
    }
}
/*
 * 轨迹模式切换
 * 初始时为总览模式（在onMounted中设置了singlePersonStore.mode = 1）
 * 当滚动高度超过1.5sc时，切换回动画模式
*/
let mapModeState = true;
function mapModeCheck(offset: number) {
    if (mapModeState && offset > window.innerHeight * 1.5) {
        mapModeState = false;
        singlePersonStore.mode = 0;
    }
    if (!mapModeState && offset < window.innerHeight * 1.5) {
        mapModeState = true;
        singlePersonStore.mode = 1;
    }
}

/**
 * 第零幕：封面
 * 封面的进入与退出
 */
const prefaceRef = ref(null);
let prefaceState = true;
function prefaceCheck(offset: number) {
    if (prefaceState && offset > window.innerHeight / 4) {
        prefaceState = false;
        d3.select(prefaceRef.value).transition().duration(500).style("top", `-${window.innerHeight}px`);
    }
    if (!prefaceState && offset < window.innerHeight / 8) {
        prefaceState = true;
        d3.select(prefaceRef.value).transition().duration(500).style("top", '0px');
    }
}

/*
 * 第二幕：出生-地图高亮控制
 * 高亮苏州[120.59, 31.30]
*/
let birthMapState = false;
function birthMapCheck(offset) {
    const isInTheRange = offset > window.innerHeight * 1.6 && offset < window.innerHeight * 2.2;
    if (!birthMapState && isInTheRange) {
        birthMapState = true;
        Layers.HighLightWidget.setHighlightPos([120.59, 31.30]);
        Layers.HighLightWidget.show();
    }
    if (birthMapState && !isInTheRange) {
        birthMapState = false;
        Layers.HighLightWidget.hide();
    }
}

/*
 * 第四幕：游历全国-内容出现消失控制
 * 游历全国提示框的进入与退出
 */
const scrollPlsRef = ref(null);
let scrollPlsState = false;
function scrollPlsCheck(offset) {
    const isInTheRange = offset > window.innerHeight * 3.4 && offset < window.innerHeight * 5;
    if (!scrollPlsState && isInTheRange) {
        scrollPlsState = true;
        d3.select(scrollPlsRef.value).transition().style("top", '0vh');
    }
    if (scrollPlsState && !isInTheRange) {
        scrollPlsState = false;
        d3.select(scrollPlsRef.value).transition().style("top", '-100vh');
    }
}

/**
 * 第六幕：死亡-地图高亮控制
 * 高亮信阳[115.057764, 32.137578]
 */
let deathMapState = false;
function deathMapCheck(offset) {
    const isInTheRange = (offset > window.innerHeight * 6.2 && offset < window.innerHeight * 6.9);
    if (!deathMapState && isInTheRange) {
        deathMapState = true;
        Layers.HighLightWidget.setHighlightPos([115.057764, 32.137578]);
        Layers.HighLightWidget.show();
    }
    if (deathMapState && !isInTheRange) {
        deathMapState = false;
        Layers.HighLightWidget.hide();
    }
}

/**
 * 第七幕：自由探索-轨迹自由探索可视化出现消失控制
 */
let exploreMapState = false;
const exploreMapRef = ref(null);
function exploreMapCheck(offset) {
    const isInTheRange = (offset > window.innerHeight * 7);
    if (!exploreMapState && isInTheRange) {
        exploreMapState = true;
        d3.select(exploreMapRef.value).transition().duration(500).style("top", '0vh');

    }
}
// 自由探索中的返回按钮
function exploreMapOnClick() {
    exploreMapState = false;
    d3.select(exploreMapRef.value).transition().duration(500).style("top", '100vh');
    playerStore.playing = false;
    singlePersonStore.mode = 0;
    // 注意重设滚动高度，放置回来之后马上又触发进入第七幕
    scrollController.setProgress(window.innerHeight * 6.9)
    scrollController.addScrollDet(-200);
}


/**
 * 注意将控制函数写在watch中！！！
 *
 * 每当滚动高度更新时，该函数被调用，offset为最新的滚动高度
 */
const storyMain = ref(null);
watch(scrollController.progress, (offset) => {
    //滚动层控制（谨慎修改）
    d3.select(storyMain.value).select(".story-content").node().scrollTop = offset;

    //检查函数，根据滚动高度决定是否执行某个动作
    prefaceCheck(offset);
    mapModeCheck(offset);
    trajectoryAnimationCheck(offset);
    birthMapCheck(offset);
    scrollPlsCheck(offset);
    deathMapCheck(offset);
    exploreMapCheck(offset);
    //加入更多你自己定义的函数

});


/** 
 * 初始化
 */
onMounted(() => {
    //初始化（谨慎修改）
    scrollController.setBoundary([0, scrollHeightPx.value]);
    singlePersonStore.mode = 0;
    playerStore.playing = false;
    playerStore.progress = 0;
    trajectoryAnimationCheck(0);
    const storyContentEl: any = d3.select(storyMain.value).select(".story-content").node();
    storyContentEl.addEventListener('scroll', (e) => { e.preventDefault(); })
    d3.select(storyMain.value).on("wheel", (event) => {
        //这里可以调整滚动速度系数，当前为0.5，数字越大滚动越快
        scrollController.addScrollDet(event.deltaY * 0.6);
        storyContentEl.dispatchEvent(new Event("scroll"));
    });
    AOS.init({
        baseElement: storyContentEl,
        mirror: true,
        offset: window.innerHeight * 0.2,
    });
    AOS.refreshHard(true);
    //可修改
    //如果不希望初始时处于总览模式，请注释下面这一行
    singlePersonStore.mode = 1;
});



</script>

<style scoped lang="scss">
.scrollystory-box {
    color: #724a2b;
    background-color: #fffbf880;
    padding: 2em 1.5em;
    text-align: left;
    border: #5a3a20 solid 0.3vh;
    box-shadow: inset #724a2bdd 0 0 2px 0px, #724a2bdd 0 0 4px 0px;
    position: absolute;
    pointer-events: auto;
}

.container.story-main {
    height: 100vh;
    width: 100vw;

    .story-map {
        pointer-events: none;
        position: fixed;
        top: 0;
        left: 0;
    }

    .story-content {
        pointer-events: none;
        position: fixed;
        right: 0;
        top: 0;
        height: 100vh;
        width: 100vw;
        overflow-y: auto;

        .scroll-belt {
            width: 100%;
            box-sizing: border-box;
            // border: 2px dashed black;
            position: relative;
            pointer-events: none;
        }

        .scroll-static {
            height: 100vh;
            width: 100vw;
            position: absolute;
            inset: 0;
        }
    }
}
</style>