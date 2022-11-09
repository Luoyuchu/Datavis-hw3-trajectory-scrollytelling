import { defineStore } from 'pinia';

export const usePlayerStore = defineStore({
    id: 'player',
    state: () => ({
        progress: 0,
        playing: false,
        curEvent: null as Object,
        playerStep: -1,
        curEdgeId: -1 as number,
        passedEdgeId: -1 as number,
    }),
    actions: {

    }
})