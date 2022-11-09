import { Point } from "@/utils/geometry";

export function arrowHeadPath(o, len, d, dAng = Math.PI * 0.5) {
    // debugger;
    let a = d.sub(o).angle() + dAng;
    let la = a + Math.PI / 12;
    let ra = a - Math.PI / 12;
    let lp = new Point(Math.cos(la), Math.sin(la)).mul(len);
    let rp = new Point(Math.cos(ra), Math.sin(ra)).mul(len);
    return `M${o.x},${o.y} l${rp.x},${rp.y} A${len},${len},0,0,1,${o.x + lp.x},${o.y + lp.y} Z`
}
export function calcArrowPath_deviation(x1, y1, x2, y2, dAng = Math.PI * 0.5, mapScaleCoef) {
    let fr = new Point(x1, y1);
    let to = new Point(x2, y2);
    let det = to.sub(fr).mul(1 / 3);
    let ang = det.angle();
    det = det.rotate(-ang);
    to = fr.add(det.mul(3));
    // let dv3 = new Point(Math.cos(dAng), Math.sin(dAng)).mul(det.len() * 12 / (Math.log(det.len() * 3 / 10) / Math.log(2)));
    let dv3 = new Point(Math.cos(dAng), Math.sin(dAng)).mul(Math.min(det.len() * 3 / (1 + 2 * Math.cos(dAng)), 400));
    let dv1 = new Point(dv3.x, -dv3.y);
    let dv2 = det.mul(3).sub(dv3).sub(dv1);
    let mid1 = fr.add(dv1);
    let mid2 = mid1.add(dv2);
    let mid3 = to.sub(new Point(Math.cos(dAng), Math.sin(dAng)).mul(8 / mapScaleCoef));
    if (isNaN(mid1.x) || isNaN(mid1.y) || isNaN(mid2.x) || isNaN(mid2.y)) {
        debugger;
    }
    return [`M${x1},${y1} C${mid1.x},${mid1.y} ${mid2.x},${mid2.y} ${mid3.x},${mid3.y}`, `rotate(${ang / Math.PI * 180}, ${fr.x},${fr.y})`, `${fr.x} ${fr.y}`]
}


export function calcArrowPath(x1, y1, x2, y2) {
    let fr = new Point(x1, y1);
    let to = new Point(x2, y2);
    let det = to.sub(fr).mul(1 / 3);
    let ang = det.angle();
    det = det.rotate(-ang);
    to = fr.add(det.mul(3));
    let vdet = det.mul(2 / 5);
    vdet = new Point(-vdet.y, vdet.x);
    let mid1 = fr.add(det).sub(vdet);
    let mid2 = mid1.add(det);
    let det23 = to.sub(mid2).mul(6 * 3 / to.sub(mid2).len())
    let mid3 = to.sub(det23);
    let mid4 = to.sub(det23.mul(5.8 / 6));
    return [`M${x1},${y1} C${mid1.x},${mid1.y} ${mid2.x},${mid2.y} ${mid3.x},${mid3.y} L${mid4.x},${mid4.y}`, `rotate(${ang / Math.PI * 180}, ${fr.x},${fr.y})`, `${fr.x} ${fr.y}`]
    // return [`M${x1},${y1} C${mid1.x},${mid1.y} ${mid2.x},${mid2.y} ${to.x},${to.y}`, `rotate(${ang / Math.PI * 180}, ${fr.x},${fr.y})`]
}


export function straightArrow(x1, y1, x2, y2) {
    return `M${x1},${y1} L${x2},${y2}`;

}
