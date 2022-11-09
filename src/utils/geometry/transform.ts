export function SVGMatrix2DOMMatrix(v: SVGMatrix) {
    return new DOMMatrix([v.a, v.b, v.c, v.d, v.e, v.f]);
}
