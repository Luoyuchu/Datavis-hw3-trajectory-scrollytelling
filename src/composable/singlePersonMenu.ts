import * as Theme from "@/theme";
import gsap from "gsap";
import { ref, watch } from "vue";
import { Point } from "@/utils/geometry";
import { svg } from "d3";
import * as Geometry from "@/utils/geometry";

const buttonDistance = 50;
const buttonCircleRadius = 30;
const iconCoef = 1.3;

export function useSinglePersonMenu(vueComponent, svgG) {
  const name = "singlePersonMenu";
  const layerRef = Symbol(name);
  let animationTimeline = null;
  let layer = null;
  let display = false;

  vueComponent[layerRef] = svgG.append("g").classed(name, true);
  layer = vueComponent[layerRef];

  const detail = layer.append("g");
  const levelDown = layer.append("g");
  const levelUp = layer.append("g");
  const svgButtons = layer.selectAll("g");
  const buttons = [detail, levelDown, levelUp];
  svgButtons
    .attrHelper({
      transform: "scale(0)",
    })
    .styleHelper({
      cursor: "pointer",
    });
  svgButtons.append("circle").attrHelper({
    cx: 0,
    cy: 0,
    r: buttonCircleRadius,
    fill: Theme.Color.borderLight,
    "fill-opacity": 0.8,
  });
  const iconSize = buttonCircleRadius * iconCoef;
  const iconAttrs = {
    fill: "white",
    height: iconSize,
    width: iconSize,
    x: -iconSize / 2,
    y: -iconSize / 2,
  };
  detail.append("use").attrHelper({
    href: "#svg-icon-detail",
    ...iconAttrs,
  });
  levelUp.append("use").attrHelper({
    href: "#svg-icon-shrink",
    ...iconAttrs,
  });
  levelDown.append("use").attrHelper({
    href: "#svg-icon-expand",
    ...iconAttrs,
  });

  const resetAnimationTimeline = () => {
    if (animationTimeline) {
      animationTimeline.progress(1);
    }
    animationTimeline = gsap.timeline({ paused: true });
  };

  const closeMenu = () => {
    if (display === false) {
      return;
    }
    resetAnimationTimeline();
    display = false;
    for (let i = 0; i < buttons.length; ++i) {
      const ang = Math.PI * ((-2 / 3) * i + 1 / 4 + 1 / 6 + 1 / 12);
      const dx = Math.cos(ang) * buttonDistance;
      const dy = Math.sin(ang) * buttonDistance * -1;
      const b = buttons[i];
      const tmp = { progress: 1 };
      animationTimeline.to(
        tmp,
        {
          progress: 0,
          onUpdate: () => {
            const x = dx * tmp.progress;
            const y = dy * tmp.progress;
            const scale = tmp.progress;
            b.attrHelper({
              transform: `translate(${x}, ${y}) scale(${scale})`,
            });
          },
          duration: 0.1,
        },
        "<"
      );
    }
    for (let i of buttons) {
      i.on("click.singlePersonMenu", null);
    }
    animationTimeline.play();
  };

  const openMenu = (pos: Point, clbk: Array<Function>) => {
    if (display) {
      closeMenu();
    }
    resetAnimationTimeline();
    display = true;
    const menuMatrix = Geometry.Transform.SVGMatrix2DOMMatrix(
      layer.node().parentNode.getScreenCTM()
    );
    const targetMatrix = new DOMMatrix([1, 0, 0, 1, pos.x, pos.y]);
    const resultMatrix = menuMatrix.invertSelf().multiplySelf(targetMatrix);
    const x = resultMatrix.e;
    const y = resultMatrix.f;
    layer.attr("transform", `translate(${x}, ${y})`);
    for (let i = 0; i < buttons.length; ++i) {
      const ang = Math.PI * ((-2 / 3) * i + 1 / 4 + 1 / 6 + 1 / 12);
      const dx = Math.cos(ang) * buttonDistance;
      const dy = Math.sin(ang) * buttonDistance * -1;
      const b = buttons[i];
      // console.log(dx, dy, `translate(${dx}, ${dy}) scale(1)`)
      const tmp = { progress: 0 };
      animationTimeline.to(tmp, {
        progress: 1,
        onUpdate: () => {
          const x = dx * tmp.progress;
          const y = dy * tmp.progress;
          const scale = tmp.progress;
          b.attrHelper({
            transform: `translate(${x}, ${y}) scale(${scale})`,
          });
        },
        duration: 0.2,
      });
    }
    animationTimeline.play();
    for (let i = 0; i < buttons.length; ++i) {
      buttons[i].on("click.singlePersonMenu", () => {
        clbk[i]();
        closeMenu();
      });
    }
  };

  return {
    openMenu,
    closeMenu,
  };
}
