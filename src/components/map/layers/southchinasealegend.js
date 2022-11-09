import * as Data from "@/data";
import * as Theme from "@/theme";
import { Point } from "@/utils/geometry";

export function register(vueComponent) {
    let layerRef = Symbol("southSeaLegend");
    let layer = null;

    vueComponent[layerRef] = vueComponent.staticContentContainer.append('g');
    layer = vueComponent[layerRef];
    drawSouthChinaSeaLegend(vueComponent);

    function setPos(x, y, scale = 0.35) {
        layer
            .attr("transform", `translate(${x}, ${y}) scale(${scale})`)
    }

    function drawSouthChinaSeaLegend(vueComponent) {
        let displayRange = [
            new Point(...vueComponent.projection([106, 23])),
            new Point(...vueComponent.projection([122, 2])),
        ];
        layer
            .attr("transform", `translate(${660}, ${170}) scale(0.35)`)
        // .attr("transform-origin", "center");
        layer
            .append("rect")
            .attr("id", "map_nanhai_box")
            .attr("x", displayRange[0].x)
            .attr("y", displayRange[0].y)
            .attr("width", displayRange[1].x - displayRange[0].x)
            .attr("height", displayRange[1].y - displayRange[0].y)
            .attr("fill", "none")
            .attr("stroke", Theme.Color.majorFontColor);

        layer
            .append("clipPath") // define a clip path
            .attr("id", "clip-path-southSeaLegend") // give the clipPath an ID
            .append("rect")
            .attr("x", displayRange[0].x)
            .attr("y", displayRange[0].y)
            .attr("width", displayRange[1].x - displayRange[0].x)
            .attr("height", displayRange[1].y - displayRange[0].y)
            .attr("fill", "none");
        let southSeaMapGroup = layer
            .append("g")
            .attr("class", "g-southSeaGeometry")
            .attr("clip-path", "url(#clip-path-southSeaLegend)");

        southSeaMapGroup
            .selectAll("path")
            .data(Data.Geodata.getChinaInlineSouthSeaGeojson().features)
            .join("path")
            .attr("stroke", Theme.Color.majorFontColor)
            .attr("fill", (d) => (d.properties.name == "九段线" ? "none" : "#eee"))
            .attr("stroke-width", "2")
            .attr("d", vueComponent.pathDrawer);

        layer
            .append("svg")
            .attr("x", displayRange[0].x)
            .attr("y", displayRange[0].y)
            .attr("width", displayRange[1].x - displayRange[0].x)
            .attr("height", displayRange[1].y - displayRange[0].y)
            .attr("viewBox", "-11 -18 115 130")
            .selectAll("path")
            .data(Data.ChinaSouthSeaIslandsConstant.getChinaSouthSeaIslandsPath())
            .join("path")
            .attr("d", (d) => d)
            .attr("stroke", "none")
            .attr("fill", Theme.Color.majorFontColor);

        layer
            .append("text")
            .text("南海诸岛")
            .style("font-size", 32)
            .style("font-family", "FZQINGKBYSJF")
            .attr("x", displayRange[1].x - 5)
            .attr("y", displayRange[1].y - 10)
            .attr("fill", Theme.Color.mapDarkerBrown)
            .attr("text-anchor", "end")
            .attr("vertical-alignment", "bottom");
    }

    function getSvgLayer() {
        return layer;
    }

    return {
        getSvgLayer,
        setPos,
    }
}




