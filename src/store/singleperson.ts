import { defineStore } from "pinia";
import type { TrajectoryType } from "@/data/dataloader/poet";

enum modeEnum {
  animation = 0,
  exploration = 1,
}

export const useSinglePersonStore = defineStore({
  id: "singleperson",
  state: () => ({
    // mode: modeEnum.animation,
    mode: modeEnum.exploration,
    contextMenuEnable: true,
    personData: null,
    trajectoriesInfo: [] as Array<TrajectoryType>,
    placeInfoClickEvent: [-1, 0] as [number, number],
    canvasCenter: [0.5, 0.5],
    scaleCompensation: 1,
  }),
  actions: {},
});
