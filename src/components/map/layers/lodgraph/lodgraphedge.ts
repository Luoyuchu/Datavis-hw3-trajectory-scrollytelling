import { Point } from "@/utils/geometry";
import { Ref, ref, watch, reactive, WatchStopHandle } from 'vue'
import { LodGraphNode } from "./lodgraphnode";
import { ANIMATION_DURATION } from "./constant"
import * as Data from "@/data";
import {usePlayerStore} from "@/store/player";


type LodGraphEdgeSvgAttrType = {
    src: Point,
    dst: Point,
    color: string,
    width: number,
    opacity: number,
}

export class LodGraphEdge {
    /* basic props */
    src: LodGraphNode;
    dst: LodGraphNode;
    /* data props */
    cnt: number;
    detail: Array<Data.Poet.TrajectoryType>;
    /* animation support props */
    srcAgg: LodGraphNode;
    dstAgg: LodGraphNode;
    metaEdges: Array<LodGraphEdge>;
    /* drawing props */
    svgElement: any;
    shadowEl: any;
    _displayAttrs = reactive({
        src: new Point(0, 0),
        dst: new Point(0, 0),
        color: '',
        opacity: 1,
        width: 1,
    })

    animationExistSteps: Array<number>;


    get displayAttrs(): LodGraphEdgeSvgAttrType {
        return this._displayAttrs;
    }
    set displayAttrs(value: any) {
        if (('src' in value && (isNaN(value.src.x) || isNaN(value.src.y))) || 
        ('dst' in value && (isNaN(value.dst.x) || isNaN(value.dst.y)))) {
            debugger;
        }
        for (let i in this._displayAttrs) {
            if (i in value) {
                this._displayAttrs[i] = value[i];
            }
        }
    }

    initializeSvgElement(layer: any) {
        if (this.svgElement) {
            this.svgElement.remove();
            this.svgElement = null;
        }
        this.svgElement = layer.append("path")
            .attrHelper({
                fill: 'none',
                // "marker-end": 'url(#lodgraph-arrow-head)',
            });
    }

    getEdgeLength(): number {
        if (this.svgElement) {
            return this.svgElement.node().getTotalLength();
        }
        return 0;
    }
    getSvgPath() {
        return this.svgElement;
    }

    animationHelper(tl: any, targetSrc: Point, targetDst: Point, deleteFlag: boolean = false, params: any = { duration: ANIMATION_DURATION, start: 0 }) {
        if (isNaN(targetSrc.x) || isNaN(targetSrc.y) || isNaN(targetDst.x) || isNaN(targetDst.y)) {
            debugger;
        }
        const tmp = {
            progress: 0,
            srcBase: this.displayAttrs.src,
            dstBase: this.displayAttrs.dst,
            srcDet: targetSrc.sub(this.displayAttrs.src),
            dstDet: targetDst.sub(this.displayAttrs.dst),
        };
        tl.to(tmp, {
            progress: 1, onUpdateParams: [tmp],
            duration: params.duration,
            onUpdate: (c) => {
                this.displayAttrs = { src: c.srcBase.add(c.srcDet.mul(c.progress)), dst: c.dstBase.add(c.dstDet.mul(c.progress)) };
            },
            onComplete: deleteFlag ? () => {
                this.svgElement.remove();
            } : () => { }
        }, params.start);
    }

    constructor(src: LodGraphNode, dst: LodGraphNode) {
        function calcD(src: Point, dst: Point): string {
            // if (typeof (src) === 'string') {
            //     debugger;
            //     const tmp = JSON.parse(`[${src}]`);
            //     src = new Point(+tmp[0], +tmp[1]);
            // }
            // if (typeof (dst) === 'string') {
            //     debugger
            //     const tmp = JSON.parse(`[${dst}]`);
            //     dst = new Point(+tmp[0], +tmp[1]);
            // }
            // console.log(src, dst);
            const direct = dst.sub(src);

            const normal = direct.rotate(Math.PI / 2).mul(0.3);
            /* Cubic bezier with normal offset in src & dst */
            // return `M ${src.x},${src.y} c ${normal.x},${normal.y} ${direct.x + normal.x},${direct.y + normal.y} ${direct.x},${direct.y}`;
            /* Quadratic  bezier with center normal offset */
            const middle = direct.mul(0.5).add(normal);
            return `M ${src.x},${src.y} q ${middle.x},${middle.y} ${direct.x},${direct.y}`;
        }

        this.src = src;
        this.dst = dst;
        this.cnt = 0;
        this.detail = [];
        this.svgElement = null;
        this.metaEdges = [];
        watch(this._displayAttrs, (newVal) => {
            if (this.svgElement) {
                if (isNaN(newVal.src.x) || isNaN(newVal.src.y) || isNaN(newVal.dst.x) || isNaN(newVal.dst.y)) {
                    debugger;
                }
                this.svgElement.attrHelper({
                    stroke: newVal.color,
                    "stroke-width": newVal.width,
                    d: calcD(newVal.src, newVal.dst),
                })
            }
        }, {
            deep: true
        })
    }
}
