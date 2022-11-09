import * as d3 from "d3";
import { Point, dArc } from "@/utils/geometry";
import { GeoTreeNode } from "../../geomap/geotree";
import {
  Ref,
  reactive,
  ref,
  watch,
  WatchStopHandle,
  ReactiveEffect,
} from "vue";
import { LodGraphEdge } from "../lodgraphedge";
import { CircleGlyph } from "./circleglyph";
import { LodGraph } from "..";
import * as Theme from "@/theme";
import * as Data from "@/data";
import * as Geometry from "@/utils/geometry";
import { useCanalStore } from "@/store/canal";
import { usePlayerStore } from "@/store/player";

const labelFontSize = 15;
const labelFontStrokeWidth = 0.2;
const labelOffset = 3;
const centerNodeRadius = 3;
const ringRadius = 5;
const ringStrokeWidth = 0.7;
const curveStrokeWidth = 2;

export type LodGraphNodeSvgAttrType = {
  x: number;
  y: number;
  r: number;
  opacity: number;
  scale: number;
  color: string;
};

export class LodGraphNode {
  graph: LodGraph;
  geoTreeNode: GeoTreeNode;

  visitCntSum: number;
  visitCnt: number;
  visitTimeSum: number;
  visitTime: number;
  visitDetailSum: Array<Data.Poet.TrajectoryType>;
  visitDetail: Array<Data.Poet.TrajectoryType>;

  visitDetailByEdge: Array<Array<Data.Poet.TrajectoryType>>;

  edge: Array<LodGraphEdge> = [];
  metaEdge: Array<LodGraphEdge> = [];
  dstEdge: Array<LodGraphEdge> = [];

  mapScale: any;
  animationExistSteps: Array<number>;

  pos: Point;
  _name: string;
  depth: number;
  dfn: [number, number];
  father: LodGraphNode;
  children: Array<LodGraphNode>;

  menu: any;

  _displayAttrs = reactive({
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    display: false,
    displayLod: 4,
    displayEventTruncate: 0,
  });
  svgG: any;
  svgCenterNode: any = null;
  svgCircles: Array<any> = [];
  svgFilledCircle: any;
  dstEdgeCircleMap = new Map<LodGraphEdge, number>();
  svgCurves: Array<any> = [];
  svgLabel: any = null;
  labelAng: number;
  glyphInfo = {
    radius: 0,
    layerN: 0,
  };

  get name(): string {
    return this._name || (this.geoTreeNode && this.geoTreeNode.name) || "不详";
  }
  set name(value: string) {
    this._name = value;
  }
  get displayAttrs() {
    return this._displayAttrs;
  }
  set displayAttrs(value: any) {
    for (let i in this._displayAttrs) {
      if (i in value) {
        this._displayAttrs[i] = value[i];
      }
    }
  }
  get display(): boolean {
    return this._displayAttrs.display;
  }
  set display(value: boolean) {
    this._displayAttrs.display = value;
  }
  get displayLod(): number {
    return this._displayAttrs.displayLod;
  }
  set displayLod(value: number) {
    this._displayAttrs.displayLod = value;
  }
  get displayEventTruncate(): number {
    return this._displayAttrs.displayEventTruncate;
  }
  set displayEventTruncate(value: number) {
    this._displayAttrs.displayEventTruncate = value;
  }

  constructor(graph: LodGraph, geoTreeNode: GeoTreeNode, mapScale: any) {
    this.graph = graph;
    this.geoTreeNode = geoTreeNode;

    this.visitCnt = 0;
    this.visitCntSum = 0;
    this.visitTime = 0;
    this.visitTimeSum = 0;
    this.visitDetail = [];
    this.visitDetailByEdge = [];
    this.visitDetailSum = [];

    this.mapScale = mapScale;

    this.display = false;
    this.displayEventTruncate = 0;
    this.menu = graph.singlePersonMenu;

    this.father = null;
    this.children = [];
    this.svgG = null;
    watch(
      this._displayAttrs,
      (newVal) => {
        if (this.svgG) {
          this.svgG.attrHelper({
            transform: `translate(${newVal.x},${newVal.y}) scale(${newVal.scale})`,
          });
        }
      },
      { deep: true }
    );
    watch(
      () => this._displayAttrs.display,
      (newVal) => {
        if (newVal === false) {
          this.cleanSvgElement();
        }
      }
    );
    let curMapScale = this.mapScale.value;
    watch(this.mapScale, (newVal: number) => {
      const nV = newVal;
      if (Math.abs(nV - curMapScale) > 0.2) {
        curMapScale = nV;
        if (this.svgLabel) {
          this.redrawLabel(nV, curMapScale);
        }
      }
    });
    // watch(() => this._displayAttrs.displayEventTruncate, (newVal) => {

    // });
    // watch(() => this._displayAttrs.displayLod, (newVal, oldVal) => {

    // });
  }

  calcVisitTime() {
    let s = 0;
    let l = 0;
    this.visitDetailSum.sort((a, b) => a.time[0] - b.time[0]);
    for (let i of this.visitDetailSum) {
      s += Math.max(0, i.time[1] - Math.max(i.time[0], l));
      l = Math.max(l, i.time[1]);
    }
    this.visitTimeSum = s;
  }

  scaleCoef(): number {
    if (this.mapScale.value >= 2) return 0.5;
    else return 1;
  }

  updateDstEdgeCircleMap() {
    this.dstEdgeCircleMap.clear();
    let cnt = 0;
    for (let i of this.dstEdge) {
      this.dstEdgeCircleMap.set(i, cnt);
      cnt += 1;
    }
    this.glyphInfo.layerN = this.dstEdge.length;
    this.glyphInfo.radius =
      this.glyphInfo.layerN * ringRadius * this.scaleCoef() * 0;
  }

  updateUpdateRadius(scale: number) {
    this.glyphInfo.radius =
      this.glyphInfo.layerN * ringRadius * this.scaleCoef() * scale;
  }

  calcCenterNodeRadius() {
    if (this.glyphInfo.radius === 0) {
      return this.graph.circleRadiusScale(this.visitCntSum);
    } else {
      return 0;
    }
  }

  calcCenterNodeOffset() {
    if (this.glyphInfo.radius === 0) {
      return this.calcCenterNodeRadius() + 2;
    } else {
      return 0;
    }
  }

  initializeLabel() {
    this.labelAng = Math.PI * Math.random() * 2;
    const radius = this.glyphInfo.radius;
    const scaleC = this.scaleCoef();
    const gap = this.calcCenterNodeOffset() + labelOffset;
    const offset = Geometry.Polygon.calcCNFontBoxOffset(
      this.name.length,
      labelFontSize * scaleC,
      gap * scaleC,
      this.labelAng
    );
    this.svgLabel = this.svgG
      .append("text")
      .text(
        this.name.length <= 2
          ? this.name
          : this.name.replace(
              /(市)|(省)|(县)|(维吾尔自治区)|(自治区)|(壮族自治区)/,
              ""
            )
      )
      .attrHelper({
        "font-family": Theme.Font.basicFont,
        "font-size": labelFontSize * scaleC,
        fill: Theme.Color.majorFontColor,
        stroke: Theme.Color.borderLight,
        "stroke-width": labelFontStrokeWidth * scaleC,
        x: offset[0],
        y: offset[1],
        "dominant-baseline": "middle",
      });
  }

  redrawLabel(newScale: number, oldScale: number) {
    const radius = this.glyphInfo.radius;
    const scaleC = Math.min(2, 1 / newScale);
    const gap = Math.max(radius, 5, this.calcCenterNodeOffset()) + labelOffset;
    const offset = Geometry.Polygon.calcCNFontBoxOffset(
      this.name.length,
      labelFontSize * scaleC,
      gap * this.scaleCoef(),
      this.labelAng
    );
    this.svgLabel.attrHelper({
      "font-size": labelFontSize * scaleC,
      "stroke-width": labelFontStrokeWidth * scaleC,
      x: offset[0],
      y: offset[1],
    });
  }

  drawGlyph() {
    this.svgG.selectAll("*").remove();
    const layerN = this.glyphInfo.layerN;
    const radius = this.glyphInfo.radius;
    const lifetime = this.graph.poetData.lifetime;
    const yearScale =
      radius === 0
        ? null
        : d3.scaleLinear([lifetime[0], lifetime[1] + 1], [0, 1]);
    const scaleC = this.scaleCoef();

    if (radius !== 0) {
      for (let i of d3.range(layerN)) {
        this.svgCircles.push(this.svgG.append("circle"));
        this.svgCircles[i].attrHelper({
          cx: 0,
          cy: 0,
          r: (radius * (i + 1)) / layerN,
          fill: "none",
          "stroke-width": ringStrokeWidth * scaleC,
          stroke: Theme.Color.singleTrajectoryNode,
        });
      }
      this.svgFilledCircle = this.svgG.append("circle").attrHelper({
        cx: 0,
        cy: 0,
        r: radius,
        fill: Theme.Color.singleTrajectoryNode,
        "fill-opacity": 0.2,
      });
      const o = new Point(0, 0);
      this.svgCurves = d3
        .range(this.graph.poetData.trajectory.length)
        .map((d) => null);
      for (let i of d3.range(layerN)) {
        const l = this.svgG;
        const r = ((radius * (i + 1)) / layerN) * scaleC;
        for (let iv of this.visitDetailByEdge[i]) {
          this.svgCurves[iv.id] = l
            .append("path")
            .classed("events-segments", true)
            .attrHelper({
              d: dArc(o, r, yearScale(iv.time[0]), yearScale(iv.time[1] + 1)),
              fill: "none",
              "stroke-width": curveStrokeWidth * scaleC,
              stroke: Theme.Color.singleTrajectoryEdge[1],
              "my-id": iv.id,
            })
            .styleHelper({
              "pointer-events": "none",
            });
        }
      }
    }
    // const isInBasin = d3.polygonContains(useCanalStore().basinPolygon, this.pos.toArray());
    const isInBasin = false;
    this.svgCenterNode = this.svgG
      .append("circle")
      .attrHelper({
        r: (this.calcCenterNodeRadius() || centerNodeRadius) * scaleC,
        cx: 0,
        cy: 0,
        fill: isInBasin
          ? Theme.Color.singleTrajectoryNodeBlue
          : Theme.Color.singleTrajectoryNode,
      })
      .styleHelper({
        // cursor: "pointer",
      });
    // .on("click", (e) => {
    //     const ctm = e.currentTarget.getScreenCTM();
    //     this.menu.openMenu(new Point(ctm.e, ctm.f), [
    //         () => {
    //             this.graph.zoomController(1, this.pos.projection(this.graph.mapProjection), true, true)
    //         },
    //         () => {
    //             this.graph.scaleSingleNode(this, 1);
    //         },
    //         () => {
    //             this.graph.scaleSingleNode(this, -1);
    //          },
    //     ]);
    // })
    this.initializeLabel();
  }

  getDstEdgePos(e: LodGraphEdge, srcPos: Point, projection: any) {
    if (
      srcPos.sub(this.pos.projection(projection)).len() < this.glyphInfo.radius
    ) {
      return this.pos.projection(projection);
    }
    const idx = this.dstEdge.indexOf(e) + 1;
    const r =
      this.glyphInfo.radius === 0
        ? this.calcCenterNodeOffset() * this.scaleCoef()
        : (idx / this.glyphInfo.layerN) * this.glyphInfo.radius;
    const projected = this.pos.projection(projection);
    const direct = projected.sub(srcPos);
    const normal = direct.rotate(Math.PI / 2).mul(0.3);
    const mid = srcPos.add(direct.mul(0.5)).add(normal);
    return mid.sub(projected).toLen(r).add(projected);
  }

  getSrcEdgePos(srcPos: Point, projection: any) {
    srcPos = srcPos.projection(projection);
    if (
      this.glyphInfo.radius !== 0 ||
      srcPos.sub(this.pos.projection(projection)).len() < this.glyphInfo.radius
    ) {
      return this.pos.projection(projection);
    }
    const r = this.calcCenterNodeOffset() * this.scaleCoef();
    const projected = this.pos.projection(projection);
    const direct = projected.sub(srcPos);
    const normal = direct.rotate(Math.PI / 2).mul(0.3);
    const mid = srcPos.add(direct.mul(0.5)).sub(normal);
    return mid.sub(projected).toLen(r).add(projected);
  }

  getVisitRecords(lod: number) {
    switch (lod) {
      case 0:
        return d3.sum(this.visitDetailSum, (d) => d.time[1] - d.time[0]);
      case 1:
        return [{ intervals: this.visitDetailSum.map((d) => d.time) }];
      case 2:
        return this.visitDetailByEdge.map((d) => ({
          intervals: d.map((di) => di.time),
        }));
      case 3:
        return this.visitDetailSum.map((d) => ({ intervals: [d.time] }));
    }
  }

  cleanSvgElement(): void {
    if (this.svgG) {
      this.svgG.remove();
      this.svgG = null;
    }
    this.svgCenterNode = null;
    this.svgLabel = null;
    this.svgCircles = [];
    this.svgCurves = [];
  }

  initializeSvgElement(layer: any): void {
    this.display = true;
    this.cleanSvgElement();
    this.svgG = layer.append("g").attrHelper({
      transform: `translate(${this._displayAttrs.x},${this._displayAttrs.y}) scale(${this._displayAttrs.scale})`,
    });
    if (this.displayLod === 0) {
      this.svgG.append("circle").attrHelper({
        "fill-opacity": 1,
        fill: "currentColor",
        r: 5,
      });
    } else {
      this.drawGlyph();
    }
  }

  isAncestor(b: LodGraphNode): boolean {
    try {
      if (this.dfn[0] <= b.dfn[0] && this.dfn[1] >= b.dfn[1]) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      debugger;
      return false;
    }
  }

  showDetail(tarG: any): void {
    const centerSize = 10;
    const radius = 100;
    const sectorD = 5;

    const layerN = this.glyphInfo.layerN;
    const lifetime = this.graph.poetData.lifetime;
    const yearScale = d3.scaleLinear([lifetime[0], lifetime[1] + 1], [0, 1]);

    const centerNode = tarG.append("circle");
    const sectors = [];
    const circles = [];
    const info = tarG.append("text");

    centerNode.attrHelper({
      fill: Theme.Color.singleTrajectoryNode,
      cx: 0,
      cy: 0,
      r: centerSize,
    });
    for (let i of d3.range(layerN)) {
      circles.push(tarG.append("circle"));
      circles[i].attrHelper({
        cx: 0,
        cy: 0,
        r: (radius * (i + 1)) / layerN,
        fill: Theme.Color.singleTrajectoryNode,
        "stroke-width": ringStrokeWidth,
        "fill-opacity": i === layerN - 1 ? 0.2 : 0,
        stroke: Theme.Color.singleTrajectoryNode,
      });
    }

    const o = new Point(0, 0);
    for (let i of d3.range(layerN)) {
      const l = this.svgG;
      const r = (radius * (i + 1)) / layerN;
      for (let iv of this.visitDetailByEdge[i]) {
        const s = l
          .append("path")
          .classed("events-segments", true)
          .attrHelper({
            d:
              dArc(
                o,
                r + sectorD,
                yearScale(iv.time[0]),
                yearScale(iv.time[1] + 1)
              ) + " M0,0 Z",
            fill: Theme.Color.mapBlue,
          });
        sectors.push(s);
      }
    }

    for (let i = 0; i <= lifetime[1]; ++i) {}
  }
}
