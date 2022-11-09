import * as Data from "@/data";
import * as Theme from "@/theme";
import * as d3 from "d3";
import { Point } from "@/utils/geometry";

const name = "provinceLabels";
const layerRef = Symbol(name);
let layer = null;



function draw(vueComponent, provinceLabels, mapScaleTier) {
    let labelFontSize = 10 / mapScaleTier;
    layer.selectAll("text")
        .data(provinceLabels)
        .join("text")
        .text(d => d.label)
        .attr("fill", Theme.Color.mapDarkerBrown)
        .attr("stroke", "#ceaf91")
        .attr("stroke-width", 0.5)
        .style('paint-order', "stroke")
        .style("pointer-events", "none")
        .attr("font-family", "FZQINGKBYSJF")
        .attr("font-size", labelFontSize)
        .attr("transform", d => {
            let p = vueComponent.projection(d.pos);
            return `translate(${p[0] - labelFontSize / 2 * d.label.length}, ${p[1] - labelFontSize / 2})`
        })
}

export function register(vueComponent) {
    vueComponent[layerRef] = vueComponent.container.append("g").classed(name, true);
    layer = vueComponent[layerRef];
    vueComponent.$watch(
        () => [vueComponent.provinceLabels, vueComponent.mapScaleTier],
        ([provinceLabels, mapScaleTier]) => {
            draw(vueComponent, provinceLabels, mapScaleTier);
        }
    );
}

export function getSvgLayer() {
    return layer;
}