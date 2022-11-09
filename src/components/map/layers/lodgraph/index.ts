import { Point } from "@/utils/geometry";
import { GeoTreeNode, GeoTree } from "../geomap/geotree";
import * as Data from "@/data";
import lodash from "lodash";
import * as d3 from "d3";
import { watch, WatchStopHandle } from "vue";
import gsap from "gsap";
import { LodGraphEdge } from "./lodgraphedge";
import { LodGraphNode } from "./lodgraphnode";
import { ANIMATION_DURATION } from "./constant";
import * as Theme from "@/theme";
import { usePlayerStore } from "@/store/player";
import { useCanalStore } from "@/store/canal";
import { useSinglePersonStore } from "@/store/singleperson";

const arrowHeadSize = [8, 5];

export class LodGraph {
  poetData: Data.Poet.PoetType;

  root: LodGraphNode;

  metaEdges: Array<LodGraphEdge>;
  metaEdgesMap: Map<LodGraphEdge, LodGraphEdge>;
  edgesCur: Array<LodGraphEdge>;

  metaNodes: Set<LodGraphNode>;
  nodesCur: Array<LodGraphNode>;
  nodesNextFrame: Array<LodGraphNode>;

  geoTree: GeoTree;
  geoTree2LodGraphNode: Map<GeoTreeNode, LodGraphNode>;

  svgLayer: any;
  svgLayerName: string;
  svgLayerRef: symbol;
  circleRadiusScale: any;
  pathWidthScale: any;
  pathColorScale: any;

  animationTimeline: any;
  autoPlayHandle: any;

  /* External MainMap Refs*/
  mapProjection: (p: [number, number]) => [number, number];
  mapPathDrawer: any;
  mapScale: any;
  zoomController: Function;
  geoMapTooltip: any;
  calcFitScale: any;

  playerStore: any;
  singlePersonStore: any;

  svgArrowHead: any;
  singlePersonMenu: any;

  animationModeWatchHandler: Array<WatchStopHandle> = [];
  explorationModeWatchHandler: Array<WatchStopHandle> = [];

  timelineLabels: any = null;

  constructor(geoTree: GeoTree, poetData) {
    this.poetData = poetData;
    this.root = null;

    this.metaEdges = [];
    this.metaEdgesMap = new Map<LodGraphEdge, LodGraphEdge>();
    this.edgesCur = [];

    this.metaNodes = new Set<LodGraphNode>();
    this.nodesCur = [];
    this.nodesNextFrame = [];

    this.geoTree = geoTree;
    this.geoTree2LodGraphNode = new Map<GeoTreeNode, LodGraphNode>();

    this.svgLayer = null;
    this.svgLayerName = "Lod-Graph";
    this.svgLayerRef = Symbol(this.svgLayerName);
    this.animationTimeline = null;
  }

  destrcutor() {
    if (this.autoPlayHandle) {
      clearTimeout(this.autoPlayHandle);
    }
    this.resetAnimationTimeline();
    this.playerStore.$reset();
    this.singlePersonStore.$reset();
  }

  scaleGlobalLOD(scaleTier: number): void {
    const dfs = (node: LodGraphNode) => {
      node.visitCntSum = node.visitCnt;
      for (let i of node.children) {
        node.visitCntSum += dfs(i);
      }
      if (scaleTier === 2) {
        if (
          (node.children.length === 0 && node.visitCntSum > 0) ||
          node.visitCnt > 0
        ) {
          this.nodesNextFrame.push(node);
        }
      }
      if (
        scaleTier === 1 &&
        (node.geoTreeNode === null ||
          (node.geoTreeNode.aid > 0 && node.geoTreeNode.aid % 10000 === 0))
      ) {
        if (node.visitCntSum > 0) {
          this.nodesNextFrame.push(node);
        }
      }
      if (
        scaleTier === 0 &&
        (node.geoTreeNode === null || node.geoTreeNode.aid === 0)
      ) {
        if (node.visitCntSum > 0) {
          this.nodesNextFrame.push(node);
        }
      }
      return node.visitCntSum;
    };
    this.nodesNextFrame = [];
    dfs(this.root);
    this.transitionNodes();
  }

  // scaleGlobalByCanal() {
  //     const dfs = (node: LodGraphNode) => {
  //         let stopFlag = true;
  //         if (node === this.root || (node.geoTreeNode && node.geoTreeNode.aid === 0)) {
  //             stopFlag = false;
  //         }
  //         else if (node.geoTreeNode === null) {
  //             stopFlag = true;
  //         }
  //         else if (node.geoTreeNode.aid % 10000 === 0) {
  //             const cd = node.children.filter(c => c.visitCntSum > 0);
  //             let nearFlag = false;
  //             for (let i of cd) {
  //                 for (let j of cd) {
  //                     if (i === j) continue;
  //                     const ip = i.pos.projection(this.mapProjection);
  //                     const jp = j.pos.projection(this.mapProjection);
  //                     if (ip.sub(jp).len() < 8) {
  //                         nearFlag = true;
  //                         break;
  //                     }
  //                 }
  //             }
  //             // if (d3.polygonContains(useCanalStore().basinPolygon, node.pos.toArray())) {
  //             if (d3.polygonContains(useCanalStore().basinPolygon, node.pos.toArray()) && !nearFlag && cd.length < 7) {
  //                 stopFlag = false;
  //             }
  //             else {
  //                 stopFlag = true;
  //             }
  //         }
  //         else {
  //             stopFlag = true;
  //         }
  //         if (stopFlag) {
  //             if (node.visitCntSum > 0) {
  //                 this.nodesNextFrame.push(node);
  //             }
  //         }
  //         else {
  //             for (let i of node.children) {
  //                 dfs(i);
  //             }
  //         }
  //         return node.visitCntSum;
  //     }
  //     this.nodesNextFrame = [];
  //     dfs(this.root);
  //     this.transitionNodes();
  // }

  scaleSingleNode(n: LodGraphNode, direction: number): void {
    if (direction === 1) {
      this.nodesNextFrame = [];
      for (let i of this.nodesCur) {
        if (i !== n) {
          this.nodesNextFrame.push(i);
        } else {
          for (let c of n.children) {
            if (c.visitCntSum > 0) {
              this.nodesNextFrame.push(c);
            }
          }
        }
      }
      this.transitionNodes();
    } else if (direction === -1) {
      const father = n.father;
      this.nodesNextFrame = [];
      father.visitCntSum = 0;
      for (let i of this.nodesCur) {
        if (i.father !== father) {
          this.nodesNextFrame.push(i);
        } else {
          father.visitCntSum += i.visitCntSum;
        }
      }
      this.nodesNextFrame.push(father);
      this.transitionNodes();
    } else {
      throw "scaleSingleNode error. NOT IMPLEMENT NOW!";
    }
  }

  reRenderAll() {
    for (let n of this.nodesCur) {
      n.initializeSvgElement(this.svgLayer);
    }
    for (let e of this.edgesCur) {
      const srcPos = e.src.pos.projection(this.mapProjection);
      const dstPos = e.dst.getDstEdgePos(e, srcPos, this.mapProjection);
      e.displayAttrs = { src: srcPos, dst: dstPos };
    }
  }

  transitionEdges() {
    const edgeMap = new Map<LodGraphNode, Map<LodGraphNode, LodGraphEdge>>();
    const metaEdgesMapNextFrame = new Map<LodGraphEdge, LodGraphEdge>();
    const findInNodesCur = (tar: LodGraphNode) => {
      for (let n of this.nodesCur) {
        if (n.isAncestor(tar)) {
          return n;
        }
      }
      return null;
    };
    const edgesNextFrame = [];
    /* aggregate metaedges */
    let maxCnt: number = 0;
    for (let i of this.metaEdges) {
      const srcN = findInNodesCur(i.src);
      const dstN = findInNodesCur(i.dst);
      const cE = this.metaEdgesMap.has(i) && this.metaEdgesMap.get(i);
      if (!edgeMap.has(srcN)) {
        edgeMap.set(srcN, new Map<LodGraphNode, LodGraphEdge>());
      }
      if (!edgeMap.get(srcN).has(dstN)) {
        const nE = new LodGraphEdge(srcN, dstN);
        edgeMap.get(srcN).set(dstN, nE);
        edgesNextFrame.push(nE);
        nE.srcAgg = nE.dstAgg = null;
        if (cE) {
          cE.srcAgg = cE.dstAgg = null;
          if (cE.src.isAncestor(nE.src)) {
            nE.srcAgg = cE.src;
          } else {
            cE.srcAgg = nE.src;
          }
          if (cE.dst.isAncestor(nE.dst)) {
            nE.dstAgg = cE.dst;
          } else {
            cE.dstAgg = nE.dst;
          }
        }
      }
      const e = edgeMap.get(srcN).get(dstN);
      metaEdgesMapNextFrame.set(i, e);
      e.metaEdges.push(i);
      e.cnt += i.cnt;
      e.detail = e.detail.concat(i.detail);
      if (e.cnt > maxCnt) {
        maxCnt = e.cnt;
      }
    }
    for (let n of this.nodesCur) {
      n.visitCntSum = 0;
    }
    let firstFlag = true;
    for (let i of this.metaEdges) {
      const e = metaEdgesMapNextFrame.get(i);
      if (firstFlag) {
        firstFlag = false;
        e.src.visitCntSum += 1;
      }
      if (e.src !== e.dst) {
        e.dst.visitCntSum += 1;
      }
    }

    this.updateNodeGlyph(this.nodesCur, edgesNextFrame);

    this.pathWidthScale = d3.scaleLog([1, maxCnt], [0.8, 2]);
    this.pathColorScale = d3
      .scaleLinear([1, edgesNextFrame.length], Theme.Color.singleTrajectoryEdge)
      .interpolate(d3.interpolateHcl);

    /*
     * edge transition animation
     */
    for (let e of this.edgesCur) {
      e.svgElement.classed("edge_next_frame", false);
      e.svgElement.classed("edge_cur", true);
      /* aggregate */
      if (e.srcAgg && e.dstAgg) {
        const nE = metaEdgesMapNextFrame.get(e.metaEdges[0]);
        let srcPos: Point;
        let dstPos: Point;
        if (e.srcAgg === e.dstAgg) {
          srcPos = dstPos = e.srcAgg.pos.projection(this.mapProjection);
        } else {
          srcPos = e.srcAgg.getSrcEdgePos(e.dstAgg.pos, this.mapProjection);
          dstPos = e.dstAgg.getDstEdgePos(nE, srcPos, this.mapProjection);
        }
        // console.log(srcPos, dstPos);
        e.animationHelper(this.animationTimeline, srcPos, dstPos, true);
      } else if (!e.srcAgg && !e.dstAgg) {
        /* distribute */
        this.animationTimeline.to(
          e.displayAttrs,
          {
            opacity: 0,
            duration: ANIMATION_DURATION / 8,
            onComplete: () => {
              e.svgElement.remove();
            },
          },
          0
        );
      } else {
        /* half aggregate */
        // const srcPos = (e.srcAgg || e.src).pos.projection(this.mapProjection);
        // const dstPos = (e.dstAgg || e.dst).pos.projection(this.mapProjection);
        const srcPos = (e.srcAgg || e.src).getSrcEdgePos(
          (e.dstAgg || e.dst).pos,
          this.mapProjection
        );
        const dstPos = (e.dstAgg || e.dst).getDstEdgePos(
          e,
          srcPos,
          this.mapProjection
        );
        const animationParams =
          e.srcAgg && e.dstAgg
            ? { duration: ANIMATION_DURATION, start: 0 }
            : { duration: ANIMATION_DURATION / 2, start: 0 };
        e.animationHelper(this.animationTimeline, srcPos, dstPos, true, {
          duration: ANIMATION_DURATION / 2,
          start: 0,
        });
      }
    }
    let idx = 0;
    for (let e of edgesNextFrame) {
      idx += 1;
      e.initializeSvgElement(this.svgLayer);
      e.svgElement.classed("edge_next_frame", true);
      if (e.src === e.dst) {
        continue;
      }
      e.displayAttrs = {
        color: this.pathColorScale(idx),
        width: this.pathWidthScale(e.cnt) / this.mapScale.value,
      };
      /* aggregate */
      if (!e.srcAgg && !e.dstAgg) {
        // const srcPos = e.src.pos.projection(this.mapProjection);
        // const dstPos = e.dst.pos.projection(this.mapProjection);
        const srcPos = e.src.getSrcEdgePos(e.dst.pos, this.mapProjection);
        const dstPos = e.dst.getDstEdgePos(e, srcPos, this.mapProjection);
        e.displayAttrs = { src: srcPos, dst: dstPos, opacity: 0 };
        this.animationTimeline.to(
          e.displayAttrs,
          { opacity: 1, duration: ANIMATION_DURATION / 8 },
          (ANIMATION_DURATION / 8) * 7
        );
      } else {
        /* distribute */
        /* half distribute */
        let cE = e;
        if (e.srcAgg && e.dstAgg) {
          if (e.srcAgg === e.src && e.dstAgg === e.dst) {
            cE = e;
          } else {
            cE = this.metaEdgesMap.get(e.metaEdges[0]);
          }
        }
        // const srcFromPos = (e.srcAgg || e.src).pos.projection(this.mapProjection);
        // const dstFromPos = (e.dstAgg || e.dst).pos.projection(this.mapProjection);
        let srcFromPos: Point;
        let dstFromPos: Point;
        const realSrc = e.srcAgg || e.src;
        const realDst = e.dstAgg || e.dst;
        if (realSrc === realDst) {
          dstFromPos = srcFromPos = realSrc.pos.projection(this.mapProjection);
        } else {
          srcFromPos = realSrc.getSrcEdgePos(realDst.pos, this.mapProjection);
          dstFromPos = realDst.getDstEdgePos(
            cE,
            srcFromPos,
            this.mapProjection
          );
        }
        e.displayAttrs = { src: srcFromPos, dst: dstFromPos };
        // const srcPos = e.src.pos.projection(this.mapProjection);
        const srcPos = e.src.getSrcEdgePos(e.dst.pos, this.mapProjection);
        const dstPos = e.dst.getDstEdgePos(e, srcPos, this.mapProjection);
        const animationParams =
          e.srcAgg && e.dstAgg
            ? { duration: ANIMATION_DURATION, start: 0 }
            : {
              duration: ANIMATION_DURATION / 2,
              start: ANIMATION_DURATION / 2,
            };
        e.animationHelper(
          this.animationTimeline,
          srcPos,
          dstPos,
          false,
          animationParams
        );
      }
      e.srcAgg = e.dstAgg = null;
    }
    this.edgesCur = edgesNextFrame;
    this.metaEdgesMap = metaEdgesMapNextFrame;
  }

  updateNodeGlyph(
    nodesCur: Array<LodGraphNode>,
    edgesCur: Array<LodGraphEdge>
  ) {
    for (let n of nodesCur) {
      n.edge = [];
      n.metaEdge = [];
      n.dstEdge = [];
      n.visitDetailByEdge = [];
    }
    for (let e of edgesCur) {
      e.src.edge.push(e);
      e.dst.dstEdge.push(e);
      e.dst.visitDetailByEdge.push(e.detail);
    }
    for (let n of nodesCur) {
      n.updateDstEdgeCircleMap();
    }
  }

  resetAnimationTimeline() {
    const that = this;
    if (this.animationTimeline) {
      this.animationTimeline.progress(1);
    }
    this.animationTimeline = gsap.timeline({
      paused: true,
      onUpdate() {
        that.playerStore.progress = this.progress() * 100;
      },
    });
  }

  transitionNodes() {
    const ancestorDict = new Map<LodGraphNode, LodGraphNode>();
    const isAncestor = (an: LodGraphNode, bn: LodGraphNode): boolean => {
      return an.dfn[0] <= bn.dfn[0] && an.dfn[1] >= bn.dfn[1];
    };
    const nodesStable: Array<LodGraphNode> = [];
    for (let n of this.nodesCur) {
      if (this.nodesNextFrame.indexOf(n) !== -1) {
        nodesStable.push(n);
      }
    }
    this.circleRadiusScale = d3.scaleLog(
      d3.extent(this.nodesNextFrame.map((n) => n.visitCntSum)),
      [4, 8]
    );
    this.nodesCur = this.nodesCur.filter((n) => nodesStable.indexOf(n) === -1);
    this.nodesNextFrame = this.nodesNextFrame.filter(
      (n) => nodesStable.indexOf(n) === -1
    );
    this.resetAnimationTimeline();
    for (let cn of this.nodesCur) {
      for (let nn of this.nodesNextFrame) {
        if (isAncestor(cn, nn)) {
          ancestorDict.set(nn, cn);
        }
        if (isAncestor(nn, cn)) {
          ancestorDict.set(cn, nn);
        }
      }
    }
    /*
            transition animation
        */
    for (let n of this.nodesCur) {
      /* merge */
      if (ancestorDict.has(n)) {
        const pEl = ancestorDict.get(n);
        const [x, y] = this.mapProjection(pEl.pos.toArray());
        const r = this.circleRadiusScale(pEl.visitCntSum);
        this.animationTimeline.to(
          n.displayAttrs,
          {
            x,
            y,
            scale: 1,
            duration: ANIMATION_DURATION,
            onComplete: () => {
              n.display = false;
            },
          },
          0
        );
      } else {
        /* split */
        this.animationTimeline.to(
          n.displayAttrs,
          {
            scale: 0,
            duration: ANIMATION_DURATION,
            onComplete: () => {
              n.display = false;
            },
          },
          0
        );
      }
    }
    this.nodesCur = [].concat(this.nodesNextFrame, nodesStable);
    this.nodesNextFrame = [];
    this.transitionEdges();
    for (let n of this.nodesCur) {
      const [x, y] = this.mapProjection(n.pos.toArray());
      if (nodesStable.indexOf(n) !== -1) {
        n.displayAttrs = { x: x, y: y, scale: 0 };
        n.initializeSvgElement(this.svgLayer);
        n.displayAttrs = { x: x, y: y, scale: 1 };
        continue;
      }
      /* split */
      if (ancestorDict.has(n)) {
        const pEl = ancestorDict.get(n);
        n.initializeSvgElement(this.svgLayer);
        n.displayAttrs = {
          x: pEl.displayAttrs.x,
          y: pEl.displayAttrs.y,
          scale: 1,
        };
        this.animationTimeline.to(
          n.displayAttrs,
          {
            x,
            y,
            scale: 1,
            duration: ANIMATION_DURATION,
          },
          0
        );
      } else {
        /* merge */
        n.initializeSvgElement(this.svgLayer);
        n.displayAttrs = { x: x, y: y, scale: 0 };
        this.animationTimeline.to(
          n.displayAttrs,
          {
            scale: 1,
            duration: ANIMATION_DURATION,
          },
          0
        );
      }
    }
    for (let n of this.nodesCur) {
      n.svgG.raise();
    }
    this.animationTimeline.play();
  }

  initializeLodTree(): void {
    let dfnCnt: number = 0;
    const dfs = (node: LodGraphNode) => {
      node.visitCntSum = node.visitCnt;
      node.visitDetailSum = [].concat(node.visitDetail);
      node.dfn = [dfnCnt, dfnCnt];
      dfnCnt += 1;
      for (let i of node.children) {
        dfs(i);
        node.visitCntSum += i.visitCntSum;
        node.visitDetailSum = node.visitDetailSum.concat(i.visitDetailSum);
        node.dfn[1] = Math.max(node.dfn[1], i.dfn[1]);
      }
      node.calcVisitTime();
    };
    dfs(this.root);
  }

  buildGeoTree(): void {
    const geoTree2LodGraphNode = this.geoTree2LodGraphNode;
    const metaNodes = this.metaNodes;
    const _this = this;
    function dfs(node: GeoTreeNode): void {
      const n = new LodGraphNode(_this, node, _this.mapScale);
      n.pos = node.centroid;
      if (node.father) {
        n.father = geoTree2LodGraphNode.get(node.father);
        n.father.children.push(n);
      }
      geoTree2LodGraphNode.set(node, n);
      for (let i of node.children) {
        dfs(i);
      }
    }
    dfs(this.geoTree.root);
    this.root = geoTree2LodGraphNode.get(this.geoTree.root);
  }

  registerArrowHead() {
    this.svgArrowHead = this.svgLayer
      .append("defs")
      .append("marker")
      .attrHelper({
        id: "lodgraph-arrow-head",
        orient: "auto",
        viewBox: "0 0 8 5",
        markerUnits: "userSpaceOnUse",
        refX: 0,
        refY: 2.5,
        markerWidth: 8,
        markerHeight: 5,
      });
    this.svgArrowHead.append("polygon").attrHelper({
      points: "0 0, 8 2.5, 0 5",
      fill: "#a5886e",
    });
  }

  scaleArrorHead(scale: number) {
    this.svgArrowHead.attrHelper({
      markerWidth: arrowHeadSize[0] * scale,
      markerHeight: arrowHeadSize[1] * scale,
    });
  }

  register(vueComponent: any): void {
    vueComponent.container.selectAll("g." + this.svgLayerName).remove();
    vueComponent[this.svgLayerRef] = vueComponent.container
      .append("g")
      .classed(this.svgLayerName, true);
    this.svgLayer = vueComponent[this.svgLayerRef];
    this.mapProjection = vueComponent.projection;
    this.mapPathDrawer = vueComponent.pathDrawer;
    this.singlePersonMenu = vueComponent.singlePersonMenu;
    this.mapScale = vueComponent.getMapScale();
    this.zoomController = (...args) => {
      vueComponent.zoomWithCenter(...args);
    };
    this.geoMapTooltip = vueComponent.geoMapTooltip;
    this.calcFitScale = (extents: [number, number][], ratio: number = 0.5) => {
      return Math.min(
        (vueComponent.width * ratio) / (extents[0][1] - extents[0][0]),
        (vueComponent.height * ratio) / (extents[1][1] - extents[1][0])
      );
    };
    this.playerStore = usePlayerStore();
    this.singlePersonStore = useSinglePersonStore();

    this.registerArrowHead();
    this.buildGeoTree();
    this.loadData(this.poetData);
    this.initializeLodTree();
    this.scaleGlobalLOD(1);
    // this.scaleGlobalByCanal();
    let curMapScaleTier = 1;
    watch(this.mapScale, (newVal: number) => {
      const newMapScaleTier = Math.max(1, Math.floor(newVal / 2) * 2);
      if (newMapScaleTier !== curMapScaleTier) {
        curMapScaleTier = newMapScaleTier;
        this.scaleArrorHead(1 / curMapScaleTier);
      }
    });
    watch(
      () => this.singlePersonStore.mode,
      (mode) => {
        console.log("mode", mode);
        if (mode == 0) {
          for (let i of this.explorationModeWatchHandler) {
            i();
          }
          this.mapScale.value = 2;
          this.scaleGlobalLOD(2);
          this.resetAnimationTimeline();
          // for (let n of this.nodesCur) {
          //     n.updateUpdateRadius(1);
          // }
          // this.reRenderAll();
          requestAnimationFrame(() =>
            setTimeout(() => this.registerAnimationMode())
          );
        } else {
          for (let i of this.animationModeWatchHandler) {
            i();
          }

          this.resetAnimationTimeline();
          // this.scaleGlobalLOD(1);
          this.mapScale.value = 1;
          //   this.scaleGlobalByCanal();
          this.scaleGlobalLOD(1);
          this.resetAnimationTimeline();
          requestAnimationFrame(() =>
            setTimeout(() => this.registerExplorationMode())
          );
          // setTimeout(() => {
          //     for (let n of this.nodesCur) {
          //         n.updateUpdateRadius(0.01);
          //     }
          //     this.reRenderAll();
          //     this.registerExplorationMode();
          // });
        }
      },
      {
        immediate: true,
      }
    );
    this.autoPlayHandle = () => { };
    // this.autoPlayHandle = setTimeout(() => {
    //   this.singlePersonStore.mode = 0;
    // }, 3000);
  }

  loadData(data: Data.Poet.PoetType): void {
    const trajectory2Node = new Map<any, LodGraphNode>();
    const insertedNode = new Map<String, LodGraphNode>();
    this.poetData = lodash.cloneDeep(data);
    for (let i of this.poetData.trajectory) {
      const p: Point = new Point(i.x_coord, i.y_coord);
      const containNode: GeoTreeNode = this.geoTree.checkContain(p);
      let node: LodGraphNode;
      if (containNode === this.geoTree.root) {
        if (insertedNode.has(i.name)) {
          node = insertedNode.get(i.name);
        } else {
          node = new LodGraphNode(this, null, this.mapScale);
          node.father = this.geoTree2LodGraphNode.get(this.geoTree.root);
          node.father.children.push(node);
          node.name = i.name;
          insertedNode.set(i.name, node);
        }
      } else {
        node = this.geoTree2LodGraphNode.get(containNode);
        node.name = i.name;
      }
      trajectory2Node.set(i, node);
      node.visitDetail.push(i);
      if (node.visitCnt > 0) {
        node.pos = node.pos
          .mul(node.visitCnt)
          .add(p)
          .mul(1 / (node.visitCnt + 1));
      } else {
        node.pos = p;
      }
      node.visitCnt += 1;
      node.visitTime += i.time[1] - i.time[0];
      this.metaNodes.add(node);
    }
    for (let i = 1; i < this.poetData.trajectory.length; ++i) {
      const src = this.poetData.trajectory[i - 1];
      const dst = this.poetData.trajectory[i];
      const e = new LodGraphEdge(
        trajectory2Node.get(src),
        trajectory2Node.get(dst)
      );
      e.cnt = 1;
      e.detail.push(this.poetData.trajectory[i]);
      this.metaEdges.push(e);
    }
  }

  scaleToFitViewport(ratio: number = 0.5, acting = true, scaleLimit = null) {
    // const xPool = [1200, 1400], yPool = [360, 560];
    const xPool = [],
      yPool = [];
    for (let n of this.nodesCur) {
      const pPos = n.pos.projection(this.mapProjection);
      xPool.push(pPos[0]);
      yPool.push(pPos[1]);
    }
    const extents = [d3.extent(xPool), d3.extent(yPool)];
    const center = [
      (extents[0][1] + extents[0][0]) / 2,
      (extents[1][1] + extents[1][0]) / 2,
    ];
    const fitScale = this.calcFitScale(extents, ratio);
    const scale = scaleLimit ? Math.min(scaleLimit, fitScale) : fitScale;
    if (acting) {
      this.zoomController(scale, center, true, false);
    }
    return [center, scale];
  }
  calcTwoPointCamera(p0: Point, p1: Point) {
    const a = p0.projection(this.mapProjection);
    const b = p1.projection(this.mapProjection);
    const nCenter = a.add(b).mul(0.5).toArray();
    const nScale = Math.min(
      3,
      this.calcFitScale([d3.extent([a.x, b.x]), d3.extent([a.y, b.y])])
    );
    return [nCenter, nScale];
  }

  registerExplorationMode() {
    this.scaleToFitViewport(0.6, true, 2.5);
    let curMapScaleTier = 1;

    const scaleWatcher = watch(this.mapScale, (newVal: number) => {
      if (this.singlePersonStore.zoomSource !== "user") return;
      const newMapScaleTier = newVal > 2.5 ? 3 : newVal > 1.8 ? 2 : 1;
      if (curMapScaleTier !== newMapScaleTier) {
        curMapScaleTier = newMapScaleTier;
        switch (curMapScaleTier) {
          case 3:
            this.scaleGlobalLOD(2);
            break;
          case 1:
            this.scaleGlobalLOD(1);
            break;
        }
      }
    });
    this.explorationModeWatchHandler.push(scaleWatcher);
  }

  cleanAnimation() {
    for (let n of this.nodesCur) {
      n.svgCenterNode.attr("r", 0);
      n.svgLabel.attr("display", "none");
    }
    for (let i of this.edgesCur) {
      i.shadowEl.attr("stroke-width", 0);
      i.getSvgPath().node().setAttribute("stroke-width", 0);
    }
  }

  getLabelProgress(edgeId: number, endFlag: boolean = false): number {
    const label = this.timelineLabels[edgeId + (endFlag ? "_end" : "")].label;
    // const currentProgress = this.animationTimeline.progress();
    this.animationTimeline.seek(label);
    const resultProgress = this.animationTimeline.progress();
    return resultProgress;
  }

  registerAnimationMode() {
    const that = this;
    const curveAnimation = false;
    const circleAnimation = false;
    const centerNodeAnimation = true;
    this.timelineLabels = {};
    const timelineLabels = this.timelineLabels;
    let stepIdx = 0;
    this.animationModeWatchHandler = [];
    /*
     * add a circle to elucidate the current position in animation
     */
    const personCircleRadius = 2;
    const personCircle = this.svgLayer.append("circle").attrHelper({
      r: personCircleRadius,
      fill: Theme.Color.singleTrajectoryNode,
      stroke: Theme.Color.majorFontColor,
      "stroke-width": 0.2,
      x: 0,
      y: 0,
    });
    /*
     * initialize edge width
     * build shadow edge for 'width-increasing' animation
     */
    for (let i of this.edgesCur) {
      i.displayAttrs.width = 0;
      i.animationExistSteps = [];
      i.cnt = 0;
      const clonedNode = i.getSvgPath().node().cloneNode();
      i.shadowEl = d3.select(this.svgLayer.node().appendChild(clonedNode));
      /* strange problem */
      i.shadowEl
        .classed("shadow-edge", true)
        .attrHelper({
          opacity: null,
          "stroke-width": 0,
          "marker-end": null,
        })
        .lower();
    }
    /* initial node size*/
    for (let n of this.nodesCur) {
      n.animationExistSteps = [];
      n.svgLabel.attr("display", "none");
      n.visitCntSum = 0;
      for (let c of n.svgCurves) {
        if (c) {
          const len = c.node().getTotalLength();
          c.attrHelper({
            "stroke-dasharray": `${len} ${len}`,
            "stroke-dashoffset": len,
          });
        }
      }
    }
    /*
     * initialize camera
     */
    // const [curCenter, curScale] = this.scaleToFitViewport(0.6, false, 2.5);
    const [curCenter, curScale] = this.calcTwoPointCamera(this.edgesCur[0].src.pos, this.edgesCur[0].src.pos);
    let curCamera = {
      cameraCenterX: curCenter[0],
      cameraCenterY: curCenter[1],
      cameraScale: curScale,
    };
    /*
     * initialize first node
     */
    this.edgesCur[0].src.visitCntSum += 1;
    const curEdgeId = this.poetData.trajectory[0].id;
    timelineLabels["0_end"] = { label: `l_end_0` };
    this.animationTimeline.addLabel(`l_end_0`);
    timelineLabels[curEdgeId] = { label: `l${curEdgeId}` };
    this.animationTimeline.addLabel(`l${curEdgeId}`);
    this.animationTimeline.to(
      {},
      {
        onUpdate() {
          if (this.progress() < 0.95) {
            that.playerStore.curEdgeId = curEdgeId;
          }
          that.playerStore.passedEdgeId = curEdgeId;
          personCircle.attr("r", 0);
          that.edgesCur[0].src.svgLabel.attr("display", null);
          that.edgesCur[0].src.svgCenterNode.attr(
            "r",
            that.circleRadiusScale(1) * /*that.edgesCur[0].src.scaleCoef()*/ 0.5
          );
        },
        duration: 0.2,
      }
    );
    /*
     *  construct animation for edges
     */
    let previousEdgeId = this.poetData.trajectory[0].id;
    for (let i of this.metaEdges) {
      const e = this.metaEdgesMap.get(i);
      const eLen = e.getEdgeLength();

      const oldWidth = e.cnt ? this.pathWidthScale(e.cnt) : 0;
      e.cnt += i.cnt;
      const curWidth = this.pathWidthScale(e.cnt);

      let edgeFlag = false;
      if (e.src !== e.dst) {
        edgeFlag = true;

        e.animationExistSteps.push(stepIdx);
        /*
         * construct camera animation
         */
        const ccCamera = curCamera;
        const [nCenter, nScale] = this.calcTwoPointCamera(e.src.pos, e.dst.pos);
        this.animationTimeline.to(ccCamera, {
          cameraCenterX: nCenter[0],
          cameraCenterY: nCenter[1],
          cameraScale: nScale,
          duration: 0.5,
          onUpdate() {
            // console.log(e, ccCamera);
            that.zoomController(
              ccCamera.cameraScale,
              [ccCamera.cameraCenterX, ccCamera.cameraCenterY],
              false,
              false
            );
            personCircle.attr("r", 0);
          },
        });
        curCamera = {
          cameraCenterX: nCenter[0],
          cameraCenterY: nCenter[1],
          cameraScale: nScale,
        };
        /*
         * construct edge widthen animation
         */
        const myStep = stepIdx;
        const pEId = previousEdgeId;
        timelineLabels[i.detail[0].id] = { label: `l${i.detail[0].id}` };
        this.animationTimeline.addLabel(`l${i.detail[0].id}`);
        this.animationTimeline.fromTo(
          e.getSvgPath().node(),
          {
            attr: {
              "stroke-dasharray": `${eLen} ${eLen}`,
              "stroke-dashoffset": eLen,
            },
          },
          {
            attr: {
              "stroke-dashoffset": 0,
            },
            onUpdate() {
              e.getSvgPath().node().setAttribute("stroke-width", curWidth);
              e.shadowEl.attr("stroke-width", oldWidth);
              that.playerStore.curEvent = i.detail[0];
              that.playerStore.curEdgeId = i.detail[0].id;
              // personCircle.attr("r", personCircleRadius);
              if (this.progress() > 0.5) {
                that.playerStore.passedEdgeId = i.detail[0].id;
              } else {
                if (pEId) {
                  that.playerStore.passedEdgeId = pEId;
                }
              }
              that.playerStore.playerStep = myStep;
            },
            ease: "none",
            immediateRender: true,
            duration: 1,
          }
        );
        /*
         * construct movement pointer animation
         */
        this.animationTimeline.to(
          personCircle.node(),
          {
            motionPath: {
              path: e.getSvgPath().node(),
            },
            duration: 1,
            ease: "none",
          },
          "<"
        );
        this.animationTimeline.fromTo(
          personCircle.node(),
          {
            attr: {
              r: personCircleRadius,
              opacity: 1,
            },
          },
          {
            attr: {
              r: 0,
              opacity: 0,
            },
            duration: 0.2,
          },
          "-=0.2"
        );
        /*
         * construct node enlarging animation
         */
        const oldVisitCntSum = e.dst.visitCntSum;
        e.dst.visitCntSum += 1;
        const newVisitCntSum = e.dst.visitCntSum;
        const oldCenterNodeR = oldVisitCntSum
          ? this.circleRadiusScale(oldVisitCntSum) * e.dst.scaleCoef()
          : 0;
        const newCenterNodeR = newVisitCntSum
          ? this.circleRadiusScale(newVisitCntSum) * e.dst.scaleCoef()
          : 0;
        this.animationTimeline.fromTo(
          e.dst.svgCenterNode.node(),
          {
            attr: {
              r: oldCenterNodeR,
            },
          },
          {
            attr: {
              r: newCenterNodeR,
            },
            onUpdate() {
              if (oldVisitCntSum === 0) {
                if (this.progress() < 0.1) {
                  e.dst.svgLabel.attr("display", "none");
                } else {
                  e.dst.svgLabel.attr("display", null);
                }
              }
              if (this.progress() < 0.95) {
                personCircle.attr("r", 0);
              }
            },
            immediateRender: false,
            duration: 1,
          }
        );
      } else {
        timelineLabels[i.detail[0].id] = { label: `l${i.detail[0].id}` };
        this.animationTimeline.addLabel(`l${i.detail[0].id}`);
      }
      timelineLabels[i.detail[0].id + "_end"] = {
        label: `l_end_${i.detail[0].id}`,
      };
      this.animationTimeline.addLabel(`l_end_${i.detail[0].id}`);
      e.dst.animationExistSteps.push(stepIdx);
      e.src.animationExistSteps.push(stepIdx);
      if (edgeFlag) {
        stepIdx += 1;
      }
      previousEdgeId = i.detail[0].id;
    }
    // this.scaleToFitViewport();
    // const findNearestAniatmionStep = (ar: Array<number>, v: number): number => {
    //   let nearest = ar[0];
    //   for (let i of ar) {
    //     if (Math.abs(nearest - v) > Math.abs(i - v)) {
    //       nearest = i;
    //     }
    //   }
    //   return nearest > v ? 100 : Math.abs(nearest - v);
    // };
    // watch(() => usePlayerStore().playerStep, (newVal) => {
    //     for (let n of this.nodesCur) {
    //         const d = findNearestAniatmionStep(n.animationExistSteps, newVal);
    //         const opacity = Math.min(1, Math.max(0.5, 1 - 0.1 * d));
    //         n.svgG.attr("opacity", opacity);
    //     }
    //     for (let e of this.edgesCur) {
    //         const d = findNearestAniatmionStep(e.animationExistSteps, newVal);
    //         const opacity = Math.min(1, Math.max(0.5, 1 - 0.1 * d));
    //         e.svgElement.attr("opacity", opacity);
    //     }
    // }, {
    //     immediate: true,
    // })
    for (let n of this.nodesCur) {
      n.svgCenterNode.attr("r", 0);
      n.svgLabel.attr("display", "none");
    }
    for (let i of this.edgesCur) {
      i.shadowEl.attr("stroke-width", 0);
    }
    that.edgesCur[0].src.svgLabel.attr("display", null);
    that.edgesCur[0].src.svgCenterNode.attr(
      "r",
      that.circleRadiusScale(1) * /*that.edgesCur[0].src.scaleCoef()*/ 0.5
    );
    this.playerStore.playerStep = 0;
    this.animationTimeline.eventCallback("onComplete", () => {
      console.log("animation complete!");
      this.playerStore.playing = false;
      // this.singlePersonStore.mode = 1;
    });
    /*
     * register animation control watcher
     */
    const playerStatusWatcher = watch(this.playerStore, (store) => {
      if (store.playing) {
        this.animationTimeline.play();
      } else {
        this.animationTimeline.pause();
        this.animationTimeline.progress(store.progress / 100, false);
      }
    });
    this.animationModeWatchHandler.push(playerStatusWatcher);
    const placeInfoClickWatcher = watch(
      () => this.singlePersonStore.placeInfoClickEvent,
      (newVal) => {
        console.log(newVal);
        if (newVal && newVal[0] !== -1) {
          let label;
          for (let i = newVal[0]; i >= 0; --i) {
            if (i in timelineLabels) {
              label = timelineLabels[i].label;
              break;
            }
          }
          console.log("goto label: ", label);
          this.animationTimeline.seek(label, false);
          this.animationTimeline.progress(this.animationTimeline.progress());
        }
      },
      {
        deep: true,
      }
    );
    this.animationModeWatchHandler.push(placeInfoClickWatcher);
    // this.playerStore.playing = true;
    this.animationModeWatchHandler.push(() => {
      for (let e of this.edgesCur) {
        e.shadowEl.remove();
      }
      personCircle.remove();
    });
  }
}
