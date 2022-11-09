import "./assets/css/main.scss";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import * as Data from "@/data";
import installElementPlus from "./plugins/element";
import * as D3Helper from "@/utils/d3helper";
// import "@/utils/loadsvg";
import gsap from "gsap";
import { morphPlugin } from "@/assets/js/MorphSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { createPinia } from "pinia";
import "aos/dist/aos.css";
gsap.registerPlugin(morphPlugin.MorphSVGPlugin, MotionPathPlugin);

async function run() {
  D3Helper.registerHelper();
  await Data.loadData();
  const pinia = createPinia();
  const app = createApp(App);
  // installElementPlus(app);
  app.use(store).use(pinia).use(router).mount("#app");
}

run();
