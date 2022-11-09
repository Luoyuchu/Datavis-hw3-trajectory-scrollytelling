import * as d3 from "d3";

export function registerAttrHelper() {
    d3.selection.prototype.attrHelper = function (dict) {
        for (let i of Object.entries(dict)) {
            this.attr(i[0], i[1])
        }
        return this;
    }
    d3.selection.prototype.styleHelper = function (dict) {
        for (let i of Object.entries(dict)) {
            this.style(i[0], i[1])
        }
        return this;
    }
}
