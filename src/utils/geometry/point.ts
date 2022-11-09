export class Point extends Array {
    [0]: number;
    [1]: number;
    constructor(x: number, y: number) {
        super();
        Object.setPrototypeOf(this, Point.prototype);
        this[0] = x;
        this[1] = y;
    }

    get x(): number {
        return this[0];
    }
    get y(): number {
        return this[1];
    }
    set x(val: number) {
        this[0] = val;
    }
    set y(val: number) {
        this[1] = val;
    }

    toArray(): [number, number] {
        return [this.x, this.y];
    }
    toOne(): Point {
        const len = this.len();
        return new Point(this.x / len, this.y / len);
    }
    toLen(l: number): Point {
        return this.toOne().mul(l);
    }
    add(o: Point): Point {
        return new Point(this.x + o.x, this.y + o.y);
    }
    sub(o: Point): Point {
        return new Point(this.x - o.x, this.y - o.y);
    }
    mul(o: number): Point {
        return new Point(this.x * o, this.y * o);
    }
    len(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    angle(): number {
        return Math.atan2(this.y, this.x);
    }
    rotate(ang: number): Point {
        return new Point(this.x * Math.cos(ang) - this.y * Math.sin(ang), this.x * Math.sin(ang) + this.y * Math.cos(ang));
    }
    projection(prj: (p: any) => [number, number]): Point {
        return new Point(...prj(this));
    }
}
