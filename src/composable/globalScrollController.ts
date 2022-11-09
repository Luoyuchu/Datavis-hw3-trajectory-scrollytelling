import { ref, Ref } from "vue";

interface GlobalScrollControllerType {
  addScrollDet: (det: number) => void;
  setBoundary: (value: [number, number]) => void;
  setProgress: (value: number) => void;
  progress: Ref<number>;
}

export function useGlobalScrollController(): GlobalScrollControllerType {
  let curProgress = 0;
  let finalProgress = ref(0);
  let toProgress = 0;
  let delayTime = 200;
  let lastTime = 0;
  let progressRange = [0, 1000];
  let curAnimationId = null;

  const addScrollDet = (det: number) => {
    toProgress += det;
    delayTime = 200;

    function start(currentTime) {
      lastTime = currentTime;
      cancelAnimationFrame(curAnimationId);
      curAnimationId = requestAnimationFrame(animate);
    }
    requestAnimationFrame(start);
  };

  function setBoundary(value: [number, number]) {
    progressRange = value;
  }

  function updateProgress() {
    finalProgress.value = curProgress;
  }

  function progressProject() {
    if (curProgress < progressRange[0]) {
      curProgress = progressRange[0];
      return true;
    }
    if (curProgress > progressRange[1]) {
      curProgress = progressRange[1];
      return true;
    }
    return false;
  }
  function setProgress(value: number) {
    cancelAnimationFrame(curAnimationId);
    toProgress = 0;
    curProgress = value;
    updateProgress();
  }
  function animate(currentTime) {
    const elapsedTime = currentTime - lastTime;
    lastTime = currentTime;
    if (elapsedTime > delayTime) {
      curProgress += toProgress;
      toProgress = 0;
      delayTime = 0;
      updateProgress();
      return;
    } else {
      const delta = (elapsedTime / delayTime) * toProgress;
      curProgress += delta;
      const flag = progressProject();
      updateProgress();
      if (flag) {
        toProgress = 0;
        delayTime = 0;
      } else {
        toProgress -= delta;
        delayTime -= elapsedTime;
        curAnimationId = requestAnimationFrame(animate);
      }
    }
  }
  return {
    addScrollDet,
    setProgress,
    setBoundary,
    progress: finalProgress,
  };
}
