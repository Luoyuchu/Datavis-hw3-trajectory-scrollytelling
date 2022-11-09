import * as Data from "@/data";
import * as d3 from "d3";
import { Point } from "./point"
import * as PolygonOffset from 'polygon-offset';
import * as Martinez from 'martinez-polygon-clipping';
import lodash from "lodash";
import { curveBumpX } from "d3";

export function calcFeatureArea(feature: Data.Geodata.GeojsonFeatureType): number {
    if (feature.geometry.type === 'Polygon') {
        return d3.polygonArea(feature.geometry.coordinates[0] as [number, number][]);
    }
    else if (feature.geometry.type === 'MultiPolygon') {
        let sum: number = 0;
        for (let i of feature.geometry.coordinates[0]) {
            sum += d3.polygonArea(i as [number, number][]);
        }
        return sum;
    }
    else {
        throw 'calculate feature area error: not a Polygon or MultiPolygon object';
    }
}

export function checkPointInsideFeature(feature: Data.Geodata.GeojsonFeatureType, p: Point): boolean {
    if (feature.geometry.type === 'Polygon') {
        return d3.polygonContains(feature.geometry.coordinates[0] as [number, number][], p.toArray());
    }
    else if (feature.geometry.type === 'MultiPolygon') {
        let result: boolean = false;
        for (let i of feature.geometry.coordinates[0]) {
            result = result || d3.polygonContains(i as [number, number][], p.toArray());
        }
        return result;
    }
    else {
        throw 'check point inside feature error: not a Polygon or MultiPolygon object';
    }
}

export function mergeLineFeatures(features: any): any {
    const r: [number, number][][] = [];
    for (let i of features) {
        if (i.geometry.type === 'LineString') {
            r.push(i.geometry.coordinates);
        }
        else if (i.geometry.type == 'MultiLineString') {
            for (let j of i.geometry.coordinates) {
                r.push(j);
            }
        }
        else {
            throw "merge line feature error: not LineString or MultiLineString";
        }
    }
    return {
        type: "Feature",
        geometry: {
            type: "MultiLineString",
            coordinates: r
        }
    }
}


export function expandLineFeatures(linesFeatures: any, value: number = 2) {
    const offset = new PolygonOffset()
    let polygon = null;
    for (let i of linesFeatures) {
        const polygonExpand = offset.data(i.geometry.coordinates).offsetLine(value);
        if (!polygon) {
            polygon = polygonExpand
        } else {
            // layer.selectAll('g').remove();
            polygon = Martinez.union(polygon, polygonExpand);
            for (let j of polygon) {
                for (let k of j) {
                    k.reverse();
                }
            }
        }
    }
    if (linesFeatures.length < 2) {
        polygon = [polygon];
    }
    return polygon;
}

type BBoxType = {
    x: number,
    y: number,
    height: number,
    width: number
};
export function mergeBBox(bboxs: Array<BBoxType>): BBoxType {
    let firstFlag = true;
    let cur = null;
    for (let i of bboxs) {
        if (i.width > 0 && i.height > 0) {
            if (firstFlag) {
                firstFlag = false;
                cur = {
                    x: i.x,
                    y: i.y,
                    height: i.height,
                    width: i.width,
                };
            }
            else {
                cur.x = Math.min(cur.x, i.x);
                cur.y = Math.min(cur.x, i.y);
                const x2 = Math.max(cur.x + cur.width, i.x + i.width);
                const y2 = Math.max(cur.y + cur.height, i.y + i.height);
                cur.width = x2 - cur.x;
                cur.height = y2 - cur.y;
            }
        }
    }
    return cur;
}

export function calcRectZoomScale(outer: [number, number][], inner: [number, number][], ratio: number): number {
    return Math.min(...([0, 1].map(d => (outer[1][d] - outer[0][d]) * ratio / (inner[1][d] - inner[0][d]))));
}

export function calcBBoxZoomScale(outer:BBoxType , inner: BBoxType, ratio: number): number {
    return calcRectZoomScale([[outer.x, outer.y], [outer.width + outer.x, outer.height + outer.y]], 
        [[inner.x, inner.y], [inner.width + inner.x, inner.height + inner.y]], 
        ratio);
}

export function calcCNFontBoxOffset(len: number, fontSize: number, gap: number, ang: number) {
    const h2 = fontSize / 2;
    const w2 = fontSize * len / 2;
    const wd = w2 / Math.cos(ang);
    const hd = h2 / Math.cos(Math.PI / 2 - ang);
    const r = Math.min(Math.abs(wd), Math.abs(hd)) + gap;
    return [Math.cos(ang) * r - w2, Math.sin(ang) * r];
}