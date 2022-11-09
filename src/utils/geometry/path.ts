import { Point } from "./point";

export function dArc(p: Point, r: number, pL: number, pR: number) {
    const e = new Point(1, 0);
    const angL = Math.PI * (2.5 - pL * 2);
    const angR = Math.PI * (2.5 - pR * 2);
    const srcDet = e.mul(r).rotate(angL);
    const dstDet = e.mul(r).rotate(angR);
    srcDet.y = -srcDet.y;
    dstDet.y = -dstDet.y;
    const srcP = p.add(srcDet);
    const dstP = p.add(dstDet);
    const flag = +((pR - pL) > 0.5);
    return `M ${srcP.x},${srcP.y} A ${r} ${r} 0 ${flag} 1 ${dstP.x} ${dstP.y}`;

}