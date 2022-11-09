/* 
 * 以下为图层必要内容
 */
//图层名称（唯一id）
const name = "highlightwidget";
const layerRef = Symbol(name);
let layer = null;
let vueComponentBelong;

export function register(vueComponent) {
    vueComponent[layerRef] = vueComponent.container.append("g");
    layer = vueComponent[layerRef];
    vueComponentBelong = vueComponent;
}
/* 
 * 以上为图层必要内容
 */


// 以下为图层功能

let pos = [120.59, 31.30];

function draw(vueComponent) {
    const circle = layer.append("circle")
        .attr("fill", 'none')
        .attr("stroke", '#724a2b')
        .attr("cx", vueComponent.projection(pos)[0])
        .attr("cy", vueComponent.projection(pos)[1]);

    function animate() {
        circle.attr("r", 0).attr("stroke-opacity", 1).attr("stroke-width", 1)
            .transition().duration(1000).attr("r", 15).attr('stroke-opacity', 0)
            .attr("stroke-width", 3)
            .on('end', animate);
    }

    animate();
}

export function show() {
    draw(vueComponentBelong);
}

export function setHighlightPos(value) {
    pos = value;
}

export function hide() {
    layer.selectAll("*").remove();
}

export function getSvgLayer() {
    return layer;
}