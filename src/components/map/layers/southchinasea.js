import * as Data from "@/data";
import * as Theme from "@/theme";

const name = "southSea";
const layerRef = Symbol(name);
let layer = null;

const strokeWidth = 0.3;

function drawSouthChinaSea(vueComponent) {
    let features = Data.Geodata.getChinaSouthSeaGeojson().features;
    // layer
    //     .selectAll("g")
    //     .data(features)
    //     .join("g")
    //     .attr("class", "g-small-province")
    //     .attr("id", (d) => "map-small-province-" + d.properties.name)
    //     .append("path")
    //     .attr("class", "small-province")
    //     .attr("stroke", Theme.Color.mapDarkBrown)
    //     .attr("stroke-width", strokeWidth)
    //     .attr("fill", "none")
    //     .attr("d", vueComponent.pathDrawer);
    layer.append('path').datum(Data.Geodata.getChinaSouthSeaGeojson())
        .attr("d", vueComponent.pathDrawer)
        .attr("stroke", Theme.Color.mapDarkBrown)
        .attr("stroke-width", strokeWidth)
        .attr("fill", "none")
}

export function register(vueComponent) {
    vueComponent[layerRef] = vueComponent.container.append("g").classed("south-sea", true);
    layer = vueComponent[layerRef];
    drawSouthChinaSea(vueComponent)
}

export function getSvgLayer() {
    return layer;
}