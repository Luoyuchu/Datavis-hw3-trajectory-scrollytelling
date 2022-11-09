import * as d3 from "d3";
import { dArc, Point } from "@/utils/geometry"
import * as Theme from "@/theme";

type GlyphEventType = {
    intervals: Array<[number, number]>,
};

export class CircleGlyph {
    radius: number;
    layerN: number;
    tickN: number;
    yearScale: any;

    events: Array<GlyphEventType>;

    containerG: any;
    glyphG: any;
    layerG: Array<any>;

    constructor(containerG: any, lifetime: [number, number], events: Array<GlyphEventType>) {
        console.log(events);
        this.containerG = containerG;
        this.events = events;
        this.layerN = this.events.length;
        this.radius = this.layerN * 5;
        this.yearScale = d3.scaleLinear([lifetime[0], lifetime[1] + 1], [0, 1]);
        this.glyphG = this.containerG.append('g').classed("circle-glyph", true);
        this.layerG = [];
        for (let i of d3.range(this.layerN)) {
            this.layerG.push(this.glyphG.append('g'));
            this.layerG[i].append('circle').attrHelper({
                cx: 0,
                cy: 0,
                r: this.radius * (i + 1) / this.layerN,
                fill: Theme.Color.singleTrajectoryNode,
                "stroke-width": 0.2,
                "fill-opacity": (i === this.layerN - 1) ? 0.05 : 0,
                stroke: Theme.Color.singleTrajectoryNode,
            })

        }
        const o = new Point(0, 0);
        for (let i of d3.range(this.layerN)) {
            const l = this.layerG[i];
            const e = this.events[i];
            const r = this.radius * (i + 1) / this.layerN;
            for (let iv of e.intervals) {
                l.append('path').classed("events-segments", true)
                    .attrHelper({
                        d: dArc(o, r, this.yearScale(iv[0]), this.yearScale(iv[1])),
                        fill: "none",
                        "stroke-width": 2,
                        stroke: Theme.Color.singleTrajectoryEdge[1]
                    });
            }
        }
    }
}
