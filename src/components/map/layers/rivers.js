import * as Data from "@/data";
import * as Theme from "@/theme";
import * as Geometry from "@/utils/geometry"
import { useCanalStore } from "@/store/canal";
import { feature } from "topojson-client";


const name = "grandCanal";
const layerRef = Symbol(name);
let layer = null;
// let canal = null;


const strokeWidthRiver = 1.5;
const strokeWidthBasin = 0.5;

function drawYelloRiver(vueComponent, features) {
    layer.append('g').classed("path-river", true)
        .selectAll("path")
        .data(features)
        .join('path')
        .attrHelper({
            stroke: Theme.Color.mapCanalColor,
            "stroke-width": strokeWidthBasin,
            fill: "none",
            d: vueComponent.pathDrawer,
        })
        .style("mouse-event", "none");
    layer.append('g').append("text").text("黄河")
        .attrHelper({
            x: vueComponent.projection([107.5, 40])[0],
            y: vueComponent.projection([107.5, 40])[1],
            'font-size': 10,
            fill: Theme.Color.majorFontColor,
            'font-family': Theme.Font.basicFont
        })
        .style("mouse-event", "none");

}

function drawYangtze(vueComponent, features) {
    layer.append('g').classed("path-river", true)
        .selectAll('path')
        .data(features)
        .join("path")
        .attrHelper({
            stroke: Theme.Color.mapCanalColor,
            "stroke-width": strokeWidthBasin,
            fill: "none",
            d: vueComponent.pathDrawer,
        })
        .style("mouse-event", "none");
    layer.append('g').append("text").text("长江")
        .attrHelper({
            x: vueComponent.projection([102, 27])[0],
            y: vueComponent.projection([102, 27])[1],
            'font-size': 10,
            fill: Theme.Color.majorFontColor,
            'font-family': Theme.Font.basicFont
        })
        .style("mouse-event", "none");
}

function updateStrokeWidth(scale) {
    layer.selectAll("path.path-river").attr("stroke-width", strokeWidthRiver * scale);
    layer.selectAll('text').attr("font-size", 10 * scale);
}

export function register(vueComponent) {
    vueComponent[layerRef] = vueComponent.container.append("g");
    layer = vueComponent[layerRef];
    drawYangtze(vueComponent, Data.Geodata.getYangtzeGeojson().features);
    const yellowRiver = Data.YellowRiver.getYellowRiverGeojsonByTime(2020);
    drawYelloRiver(vueComponent, yellowRiver.features);
    let curScaleTier = 1;
    vueComponent.$watch(
        () => vueComponent.mapScale,
        (newVal) => {
            const newScaleTier = Math.max(1, Math.floor(newVal / 2) * 2);
            if (newScaleTier !== curScaleTier) {
                curScaleTier = newScaleTier;
                updateStrokeWidth(1 / curScaleTier);
            }
        })
}

export function getSvgLayer() {
    return layer;
}