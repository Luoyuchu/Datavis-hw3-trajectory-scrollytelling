import { createRouter, createWebHashHistory } from 'vue-router';
import StoryMainVue from "../views/StoryMain.vue";


const base = import.meta.env.BASE_URL;

const routes = [
    { path: '/', component: StoryMainVue },
]

const router = createRouter({
    history: createWebHashHistory(base),
    routes
})

export default router