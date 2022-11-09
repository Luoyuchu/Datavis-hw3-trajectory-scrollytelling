import * as Data from "@/data";
import * as Theme from "@/theme";

const name = "neighborArea";
const layerRef = Symbol(name);
let layer = null;

function draw(vueComponent) {
    layer
        .selectAll('path')
        .data(Data.Geodata.getNeighborAreaGeojson().features)
        .join("path")
        .attr("stroke", Theme.Color.borderLight)
        .attr("stroke-opacity", "0.7")
        .attr("stroke-width", 0.3)
        .attr("fill", "none")
        .attr("d", vueComponent.pathDrawer);

}

function updateHighlight(flag) {
    layer
        .selectAll("path").attr("stroke", (flag ? "#aaa" : Theme.Color.borderLight));
}

export function register(vueComponent) {
    vueComponent[layerRef] = vueComponent.container.append("g").classed(name, true);
    layer = vueComponent[layerRef];
    draw(vueComponent)
    vueComponent.$watch(
        () => vueComponent.provinceSelected,
        (provinceSelected) => {
            updateHighlight(!!provinceSelected);
        }
    )
}

export function getSvgLayer() {
    return layer;
}