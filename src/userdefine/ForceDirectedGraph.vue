<template>
    <div class="container rel-graph" ref="containerRef">
        <svg>
        </svg>
    </div>
</template>


<script setup>
import { onMounted, ref } from "vue";
import * as d3 from "d3";

const containerRef = ref(null);
let data = null;
let width = 0, height = 0;

function draw_graph() {
    let svg = d3.select(containerRef.value)
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    // 定义颜色比例尺
    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let links = data.links;
    let nodes = data.nodes;

    // 调用d3的force-directed graph实现
    let simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    // 实现拖拽后重新进行图布局
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // links
    let link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    // nodes
    let node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", d => color(d.group))
        .call(drag(simulation));

    // title
    node.append("title")
        .text(d => d.id);

    // 绘制links和nodes
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}

onMounted(() => {
    height = d3.select(containerRef.value).node().offsetHeight;
    width = d3.select(containerRef.value).node().offsetWidth;
    d3.json("rel_data_dingwei.json").then((d) => {
        data = d;
        draw_graph();
    })
})

</script>


<style scoped lang="scss">
.container.rel-graph {
    height: 100%;
    width: 100%;

    svg {
        height: 100%;
        width: 100%;
    }
}
</style>

