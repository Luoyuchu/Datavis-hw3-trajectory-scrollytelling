import * as Data from "@/data";
import * as Theme from "@/theme";

const name = "provinceMap";
const layerRef = Symbol(name);
let layer = null;

export function draw(pathDrawer, provinceName, mapScaleTier) {
    layer.selectAll("path").remove();
    if (provinceName && mapScaleTier >= 2) {
        layer
            .selectAll("path")
            .data(Data.Geodata.getProvinceGeojson(provinceName).features)
            .join("path")
            .attr("d", pathDrawer)
            .attr("fill", "none")
            .attr("stroke", Theme.Color.majorFontColor)
            .attr("stroke-width", 0.2)
            .attr("stroke-opacity", 0.2)
            .style("pointer-events", "none");
    }
}

export function register(vueComponent) {
    vueComponent[layerRef] = vueComponent.container.append("g").classed(name, true);
    layer = vueComponent[layerRef];
    vueComponent.$watch(
        () => [vueComponent.provinceSelected, vueComponent.mapScaleTier],
        ([provinceName, mapScaleTier]) => {
            draw(
                vueComponent.pathDrawer,
                provinceName,
                mapScaleTier,
            )
        }
    )
}

export function getSvgLayer() {
    return layer;
}