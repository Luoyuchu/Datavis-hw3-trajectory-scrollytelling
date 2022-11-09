import { defineStore } from 'pinia'

export const useCanalStore = defineStore({
    id: 'canal',
    state: () => ({
        basinPolygon: null as [number, number][]

    }),
    actions: {

    }
})