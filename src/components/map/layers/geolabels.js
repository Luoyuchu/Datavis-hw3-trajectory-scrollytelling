import * as Data from "@/data";
import * as Theme from "@/theme";
import * as d3 from "d3";
import { Point } from "@/utils/geometry";
import {useCanalStore} from "@/store/canal";

const name = "geoLabels";
const layerRef = Symbol(name);
let layer = null;

export function draw(vueComponent, geoLabels, mapScaleTier) {
    //split the labels to multiple line trying to squarify the final bounding box
    function squareSplit(labels) {
        let s = d3.sum(labels.map(d => d[0].length));
        let sq = Math.ceil(Math.sqrt(s));
        let r = [];
        let acc = 0;
        for (let i of labels) {
            if (r.length === 0 || acc + 1 + i[0].length > sq) {
                r.push([i]);
                acc = i[0].length;
            } else {
                r[r.length - 1].push(i);
                acc += i[0].length;
            }
        }
        return [r, [d3.max(r, ri => d3.sum(ri, rii => rii[0].length)), r.length]];
    }

    let labelFontSize = 10 / mapScaleTier;
    layer.selectAll('g').remove();
    layer.selectAll('g')
        .data(geoLabels.filter(d => d.labels.length > 0))
        .join("g")
        .call(g => {
            g.append('text')
                .attr("transform", d => {
                    let [_, [w, h]] = squareSplit(d.labels);
                    h = h / 2 * labelFontSize;
                    w = w / 2 * labelFontSize;
                    let len = new Point(w, h).len() + 5;
                    return `translate(${d.pos[0] + Math.cos(d.ang) * len - w}, ${d.pos[1] + Math.sin(d.ang) * len - h})`;
                })
                .attr("fill", Theme.Color.mapDarkerBrown)
                .attr("stroke", "#ceaf91")
                .attr("stroke-width", 0.5)
                .style('paint-order', "stroke")
                .style("pointer-events", "none")
                .attr("font-family", "FZQINGKBYSJF")
                .attr("font-size", labelFontSize)
                .selectAll('tspan')
                .data(d => squareSplit(d.labels)[0])
                .join('tspan')
                .text(d => d.map(t => t[0]).join('，'))
                .attr("dy", labelFontSize)
                .attr("x", 0);
        });
    //draw dots
    layer.selectAll('g')
        .filter((d) => d.labels.length > 0)
        .append('circle')
        .attr("r", d => d3.polygonContains(useCanalStore().basinPolygon, vueComponent.projection.invert(d.pos)) ? 4 : 2)
        .attr("fill", d => d3.polygonContains(useCanalStore().basinPolygon, vueComponent.projection.invert(d.pos)) ? Theme.Color.mapBlue : Theme.Color.majorFontColor)
        .attr("cx", d => d.pos[0])
        .attr("cy", d => d.pos[1]);
}

export function register(vueComponent) {
    vueComponent[layerRef] = vueComponent.container.append("g").classed(name, true);
    layer = vueComponent[layerRef];
    vueComponent.$watch(
        () => [vueComponent.arrowsLabel, vueComponent.mapScaleTier],
        ([arrowsLabel, mapScaleTier]) => {
            draw(vueComponent, arrowsLabel, mapScaleTier);
        }
    );
}

export function getSvgLayer() {
    return layer;
}