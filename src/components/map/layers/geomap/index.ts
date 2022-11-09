import * as d3 from "d3";
import * as Theme from "@/theme";
import * as Data from "@/data";
export { GeoTree } from "./geotree";

const name = "geoMap";
const layerRef = Symbol(name);
let layer = null;

const strokeWidth = 0.3;

function draw(vueComponent) {
  layer
    .selectAll("path")
    .data(Data.Geodata.getChinaGeojson().features)
    .join("path")
    .attr("d", vueComponent.pathDrawer)
    .attr("fill", "url(#ricepaper)")
    .attr("stroke", Theme.Color.mapDarkBrown)
    .attr("stroke-width", strokeWidth);
  // .style("mix-blend-mode", "multiply")
  // .on("dblclick", (e) => {
  //   vueComponent.zoomWithCenter(
  //     0,
  //     vueComponent.projection(d3.select(e.target).datum()["properties"].cp)
  //   );
  // });
}

function registerProvinceHover(vueComponent) {
  layer
    .selectAll("path")
    .on("mouseenter", (e) => {
      d3.select(e.target)
        .attr(
          "filter",
          "drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.3)) brightness(1.05)"
        )
        .attr("transform", "scale(1.01)")
        .attr("transform-origin", (d: any) => {
          let r = vueComponent.projection(d.properties.cp);
          return `${r[0]} ${r[1]}`;
        });
    })
    .on("mouseleave", (e) => {
      d3.select(e.target).attr("filter", null).attr("transform", null);
    });
}

function updateStrokeWidth(scale) {
  layer.selectAll("path").attr("stroke-width", strokeWidth * scale);
}

export function register(vueComponent, color) {
  vueComponent[layerRef] = vueComponent.container
    .append("g")
    .classed(name, true);
  layer = vueComponent[layerRef];
  draw(vueComponent);
  registerProvinceHover(vueComponent);
  let curScaleTier = 1;
  vueComponent.$watch(
    () => vueComponent.mapScale,
    (newVal) => {
      const newScaleTier = Math.max(1, Math.floor(newVal / 1.5) * 1.5);
      if (newScaleTier !== curScaleTier) {
        curScaleTier = newScaleTier;
        updateStrokeWidth(1 / curScaleTier);
      }
    }
  );
}

export function getSvgLayer() {
  return layer;
}
