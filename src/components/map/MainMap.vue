<template>
  <div class="container">
    <svg>
      <FiltersVue></FiltersVue>
      <GradientsVue></GradientsVue>
      <MarkersVue></MarkersVue>
      <PatternsVue></PatternsVue>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import * as Data from "@/data";
import { Point } from "@/utils/geometry";
import { mapState } from "vuex";
import * as Layers from "@/components/map/layers";
import * as Theme from "@/theme";
import { ref } from "vue";
import FiltersVue from "@/theme/svgdefs/filters.vue";
import GradientsVue from "@/theme/svgdefs/gradients.vue";
import MarkersVue from "@/theme/svgdefs/markers.vue";
import PatternsVue from "@/theme/svgdefs/patterns.vue"
import { addParticleBackground } from "@/utils/other/particlebackground";
import { setCurrentLodGraph } from "../../store/mapController";
import { useSinglePersonStore } from "@/store/singleperson"
import { useSinglePersonMenu } from "@/composable/singlePersonMenu";
import * as Geometry from "@/utils/geometry";


export default {
  name: "MainMap",
  props: ["canvasWidth", "canvasHeight", "storytelling"],
  setup() {
    const mapScale = ref(1);
    const mapScaleTier = ref(1);
    const getMapScale = () => mapScale;
    const getMapScaleTier = () => mapScaleTier;
    return {
      mapScale,
      mapScaleTier,
      getMapScale,
      getMapScaleTier,
    };
  },
  components: {
    FiltersVue,
    GradientsVue,
    MarkersVue,
    PatternsVue,
  },
  data() {
    return {
      mapData: null,
      arrowsLabel: null,
      shortArrows: null,
      provinceLabels: [],
    };
  },
  computed: {
    ...mapState([
      "yearRange",
      "infoYearRange",

      "provinceSelected",

      "balanceRange",
      "provinceSelectedPolygon",

      "arrowInterval",
      "balanceInterval",

      "arrows",
      "arrowHover",

      "componentsState",

      "singlePersonId",
    ]),
    cameraPars() {
      return [useSinglePersonStore().canvasCenter, useSinglePersonStore().scaleCompensation];
    }
  },
  watch: {
    cameraPars: {
      handler(newVal) {
        const newScale = newVal[1];
        const newCenter = newVal[0];
        const translate = new Point(this.width * newCenter[0], this.height * newCenter[1]).sub(
          new Point(this.width / 2, this.height / 2).mul(newScale))
          console.log(translate, newScale, newCenter, this.width, this.height);
        this.containerWrapper2.interrupt().transition()
          .attr("transform", `translate(${translate[0]}, ${translate[1]}) scale(${newScale})`);
      },
      deep: true,
    },
    mapScale: {
      handler() {
        let t = Math.floor(Math.max(1, Math.log(this.mapScale) / Math.log(2)));
        this.mapScaleTier = t;
      }
    },
    yearRange: {
      handler() {
        this.mapData = Data.CBDBMigration.getDataByTimeRange(this.yearRange[0], this.yearRange[1]);
      },
      deep: true,
    },
  },
  methods: {
    zoomWithCenter(scale = 0, center = null, transition = true, overlay = true) {
      const cTransform = d3.zoomTransform(this.containerWrapper.node());
      const cScale = cTransform.k;
      const cCenter = [(this.width * 0.5 - cTransform.x) / cTransform.k, (this.height * 0.5 - cTransform.y) / cTransform.k];
      if (center === null) {
        center = cCenter;
      }
      if (transition === true) {
        transition = 400;
      }
      if (scale === 0) {
        if (transition) {
          this.containerWrapper
            .transition()
            .duration(transition)
            .call(this.zoomController.transform, d3.zoomIdentity);
        }
        else {
          this.containerWrapper
            .call(this.zoomController.transform, d3.zoomIdentity);
        }

      }
      else {
        let nScale = overlay ? Math.max(0.5, Math.min(cScale * scale, 8)) : scale;
        let nTranslate = new Point(...this.zoomController.extent()()[1]).mul(0.5).sub(new Point(...center).mul(nScale));
        if (transition) {
          this.containerWrapper
            .transition()
            .duration(transition)
            .call(this.zoomController.transform, d3.zoomIdentity.translate(...nTranslate).scale(nScale));
        }
        else {
          this.containerWrapper
            .call(this.zoomController.transform, d3.zoomIdentity.translate(...nTranslate).scale(nScale));
        }
      }
    },

    //map zoom and pan
    registerZoomController(width, height) {
      const that = this;
      const chinaBox = [
        ...this.projection([70, 55]),
        ...this.projection([140, 10])
      ];
      // const cw = (chinaBox[0] + chinaBox[2]) / 2;
      // const ch = (chinaBox[1] + chinaBox[3]) / 2;
      const center = [width / 2, height / 2];
      function zoomed(e) {
        if (that.singlePersonMenu) {
          that.singlePersonMenu.closeMenu();
        }

        const t = e.transform;
        if (t.invertX(center[0]) > chinaBox[2]) t.x = center[0] - chinaBox[2] * t.k;
        else if (t.invertX(center[0]) < chinaBox[0]) t.x = center[0] - chinaBox[0] * t.k;
        if (t.invertY(center[1]) > chinaBox[3]) t.y = center[1] - chinaBox[3] * t.k;
        else if (t.invertY(center[1]) < chinaBox[1]) t.y = center[1] - chinaBox[1] * t.k;
        return t;
      }
      this.zoomController = d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([1, 8])
        .on("zoom", (e) => {
          this.container.attr("transform", zoomed(e));
          if (e.sourceEvent) {
            useSinglePersonStore().zoomSource = 'user';
          }
          this.mapScale = d3.zoomTransform(this.containerWrapper.node()).k;

        })
      this.containerWrapper.call(this.zoomController).on("dblclick.zoom", null);
    },

    registerZoomButton(width, height) {
      this.zoomButton = this.containerWrapper.append('g')
        .classed("zoom-button", true)
        .attr("transform", `translate(${width - 50}, ${height * 0.8 - 80})`)
        .styleHelper({
          cursor: "pointer",
        });
      const zoomIn = this.zoomButton.append('g');
      const zoomOut = this.zoomButton.append('g').attr("transform", `translate(0, 40)`);
      const boxAttr = {
        width: 30,
        height: 30,
        x: 0,
        y: 0,
        fill: Theme.Color.borderLight + "80",
        stroke: Theme.Color.majorFontColor,
      };
      const symbolAttr = {
        "stroke-width": 3,
        stroke: Theme.Color.majorFontColor,
      }
      zoomIn.append('rect').attrHelper(boxAttr);
      zoomOut.append('rect').attrHelper(boxAttr);
      zoomIn.append('path').attrHelper({
        d: 'M15,5 v20 M5,15 h20',
        ...symbolAttr
      });
      zoomOut.append('path').attrHelper({
        d: "M5,15 h20",
        ...symbolAttr
      });
      zoomIn.on("click", () => this.zoomWithCenter(1.5, null));
      zoomOut.on("click", () => this.zoomWithCenter(0.666, null));
    },


    buildSvg(sWidth, sHeight) {
      const width = 1920;
      const height = (sHeight / sWidth) * width;
      this.width = width;
      this.height = height;
      this.svg = d3.select(this.$el).select("svg");
      this.svg
        .attr("width", sWidth)
        .attr("height", sHeight)
        .attr("viewBox", `0 0 ${width} ${height}`);
      this.containerWrapper2 = this.svg.append("g");
      this.containerWrapper = this.containerWrapper2.append("g");
      this.container = this.containerWrapper.append("g");
      this.tooltipContainer = this.containerWrapper.append('g').classed("tooltip-container", true);
      this.menuContainer = this.containerWrapper.append('g').classed("menu-container", true);
      this.staticContentContainer = this.containerWrapper.append('g').classed("static-content", true);
    },
    initializeSingle(sWidth, sHeight) {
      const width = 1920;
      const height = (sHeight / sWidth) * width;
      this.buildSvg(sWidth, sHeight);
      /* back rectangle for click, pan and zoom convience */
      this.containerWrapper
        .append("rect")
        .attrHelper({
          width: width,
          height: height,
          x: 0,
          y: 0,
          'fill-opacity': 0
        })
        .lower()
        .on("click", () => {
          this.$store.commit("setProvinceSelected", ["", null, null]);
        })
      // .on("dblclick", () => {
      //   this.zoomWithCenter();
      // });
      /* projection for map*/
      this.projection = d3
        .geoMercator()
        .center([99, 31])
        .scale(900 * Math.min(width / 1920, height / 734))
        .translate([width * 0.55, height * 0.6]);
      /* svg path drawer for projection */
      this.pathDrawer = d3.geoPath(this.projection);

      Layers.NeighborArea.register(this);
      Layers.SouthChinaSea.register(this);
      Layers.GeoMap.register(this);
      Layers.Rivers.register(this);
      if (this.storytelling) {
        //加入你的自定义图层
        Layers.HighLightWidget.register(this);
      }
      this.singlePersonMenu = useSinglePersonMenu(this, this.menuContainer);
      let geoTree = new Layers.GeoMap.GeoTree(Data.Geodata.getChinaADTree());
      const trajectoryData = useSinglePersonStore().personData;
      this.$store.commit("setSinglePersonData", trajectoryData);
      useSinglePersonStore().trajectoriesInfo = trajectoryData.trajectory;
      let lodGraph = new Layers.LodGraph.LodGraph(geoTree, trajectoryData);
      lodGraph.register(this);
      if (this.storytelling) {
        setCurrentLodGraph(lodGraph);
      }
      useSinglePersonStore().currentLodGraph = lodGraph;
      this.registerZoomController(width, height);
      if (!this.storytelling) {
        this.registerZoomButton(width, height);
        this.zoomButton.attr("transform", `translate(${width - 50}, ${height * 0.73})`)
      }
    },
    destructSingle() {
      this.lodGraph.destrcutor();
    },
  },
  mounted() {
    this.initializeSingle(this.canvasWidth, this.canvasHeight);
  },
  beforeUnmount() {
    this.destructSingle();
  }
};
</script>
