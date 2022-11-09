import gsap from "gsap"
import * as d3 from "d3";


export function addParticleBackground(svg: SVGAElement, ammount: number = 100) {
    const viewBox = svg.getAttribute("viewBox").split(/\s+|,/).map(d => +d);
    const container = d3.select(svg).append('g');
    container.append('defs').node().innerHTML =
        `<radialGradient id="particle-background-radial-gradient">
        <stop offset="10%" stop-color="rgba(230,185, 149, 1)" />
        <stop offset="70%" stop-color="rgba(230,185, 149, 0.5)" />
        <stop offset="100%" stop-color="rgba(230,185, 149, 0)" />
        </radialGradient>`
    for (let i = 0; i < ammount; ++i) {
        const r = Math.random() * 7 + 6;
        const x = [viewBox[0], viewBox[0] + viewBox[2]];
        const y = d3.range(2).map(d => viewBox[1] + (Math.random() - 0.25) * (viewBox[3] * 2));
        const particle = container.append('circle')
            .classed("background-particle", true)
            // @ts-ignore
            .attrHelper({
                fill: "url(#particle-background-radial-gradient)",
                stroke: "none",
                r
            });
        gsap.to(particle.node(), {
            attr: {
                r: r * 0.5,
            },
            duration: Math.random() * 2 + 2,
            repeat: -1,
            yoyo: true,
        }).progress(Math.random());
        gsap.fromTo(particle.node(),
            {
                attr:
                {
                    cx: x[0] - 10,
                    cy: y[0],
                }
            },
            {
                attr: {
                    cx: x[1],
                    cy: y[1],
                },
                duration: Math.random() * 30 + 30,
                repeat: -1,
                yoyo: false,
                ease: "none",
            }).progress(Math.random());
    }
}