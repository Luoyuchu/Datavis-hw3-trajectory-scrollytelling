import { createStore } from 'vuex'
import * as d3 from "d3";
import * as Theme from "@/theme"

const debug = false;

function getNicePar(v) {
    if (v < 1) {
        return 1;
    }
    return 10 ** Math.floor(Math.log(v) / Math.log(10));
}

function getRound(v, r, d) {
    if (d === 'up') {
        return Math.ceil(v / r) * r;
    } else if (d === 'down') {
        return Math.floor(v / r) * r;
    } else {
        return Math.round(v / r) * r;
    }
}

export default createStore({
    state: {
        yearRange: [-450, 1950],
        infoYearRange: [-450, 1950],
        // yearRange: [1368, 1644],
        // infoYearRange: [1368, 1644],
        balanceColor: [Theme.Color.mapLegendColor4, Theme.Color.mapLegendColor5, Theme.Color.mapLegendColor6, Theme.Color.mapLegendColor7, Theme.Color.mapLegendColor8],
        balanceRange: [0, 0],
        balanceInterval: [],

        provinceSelected: "",
        provinceSelectedPolygon: null,
        provinceInOut: [0, 0],

        spotFloodInterval: [],
        canalArea: null,
        prefaceDynastyInfo: null,
        manualRouter: 2,

        // singlePersonId: 663,
        singlePersonId: 1000000,
        // singlePersonId: 1000115,
        // singlePersonId: 1000071,
        // singlePersonId: 1000081,
        // singlePersonId: 200293,
        singlePersonData: null,

        arrows: [],
        arrowHover: -1,
        arrowClick: [-1, 0],
        arrowRange: [0, 0],
        arrowInterval: [],

        kernel_width: 1.0,
        axisLength: 6,
        axisAngle: 180,
        axisTag: "all",

        showInfoCard: true,
        floodInfo: [],
        componentsState: {
            scatterplotOut: {
                enable: false,
                name: "出发地分布",
            },
            scatterplotIn: {
                enable: false,
                name: "到达地分布",
            },
            contourplotIn: {
                enable: false,
                name: "出发地密度"
            },
            contourplotOut: {
                enable: false,
                name: "到达地密度"
            },
        }
    },
    mutations: {
        setArrowClick(state, payload) {
            state.arrowClick = payload;
        },
        setSinglePersonId(state, payload) {
            state.singlePersonId = payload;
        },
        setSinglePersonData(state, payload) {
            state.singlePersonData = payload;
        },
        setManualRouter(state, payload) {
            state.manualRouter = payload;
        },
        setPrefaceDynastyInfo(state, payload) {
            state.prefaceDynastyInfo = payload;
            // console.log("here")
        },
        setCanalArea(state, payload) {
            state.canalArea = payload;
        },
        setFloodInfo(state, payload) {
            state.floodInfo = payload;
        },
        setSpotFloodInterval(state, payload) {
            state.spotFloodInterval = payload;
        },
        setComponentsState(state, payload) {
            for (let i in state.componentsState) {
                let cur = state.componentsState[i];
                if (payload.indexOf(cur.name) !== -1) {
                    cur.enable = true;
                } else {
                    cur.enable = false;
                }
            }
        },
        revertShowInfoCard(state) {
            state.showInfoCard = !state.showInfoCard;
        },
        setArrowHover(state, payload) {
            state.arrowHover = payload;
        },
        resetArrowHover(state, payload) {
            if (state.arrowHover == payload) {
                state.arrowHover = -1;
            }
        },
        setProvinceHover(state, payload) {
            state.provinceHover = payload;
        },
        setProvinceInOut(state, payload) {
            state.provinceInOut = payload;
        },
        setProvinceSelected(state, payload) {
            state.provinceSelected = payload[0];
            state.provinceSelectedPolygon = payload[1];
            state.provinceInOut = payload[2];
        },
        setArrows(state, payload) {
            state.arrows = payload;
            state.arrowRange = payload.length ? d3.extent(state.arrows.map(d => d.value)) : [0, 1];
            let tmp = [];
            if (state.arrowRange[1] <= 3) {
                for (let i = 1; i <= state.arrowRange[1]; ++i) {
                    tmp.push([i, i, i + 1])
                }
                // console.log(tmp);
            } else {
                let last = 1;
                for (let i = 1; i <= 3; ++i) {
                    tmp.push([last, Math.floor(Math.exp(Math.log(state.arrowRange[1]) / 3 * i)), i + 1]);
                    last = tmp[tmp.length - 1][1] + 1;
                }
            }
            if (tmp.length >= 3) {
                let rp = getNicePar(tmp[0][1]);
                tmp[0][1] = getRound(tmp[0][1], rp);
                tmp[1][0] = tmp[0][1] + 1;
                tmp[1][1] = getRound(tmp[1][1], rp);
                tmp[2][0] = tmp[1][1] + 1;
                tmp[2][1] = getRound(tmp[2][1], getNicePar(tmp[2][1] - tmp[2][0]), 'up');
            }
            state.arrowInterval = tmp;
            // console.log(state.arrowRange)
        },
        setBalanceRange(state, payload) {
            state.balanceRange = payload;
            console.log(payload);
            let det = [-state.balanceRange[0], state.balanceRange[1]]
            let tmp = [];
            tmp.push([-Math.floor(det[0] / 5), Math.floor(det[1] / 5), state.balanceColor[2]]);
            // console.log([-Math.floor(det[0] / 5), Math.floor(det[1] / 5), state.balanceColor[2]]);
            for (let i = 0; i < 2; ++i) {
                for (let j = 0; j < 2; ++j) {
                    let l = det[j] * (i * 2 + 1);
                    let r = det[j] * (i * 2 + 3);
                    l = Math.ceil((l + 1) / 5);
                    r = Math.floor(r / 5);
                    if (j == 0) {
                        [l, r] = [-r, -l];
                    }
                    if (r >= l) {
                        tmp.push([l, r, state.balanceColor[2 + (j * 2 - 1) * (i + 1)]]);
                        // console.log([l, r, state.balanceColor[2 + (j * 2 - 1) * (i + 1)]]);
                    }
                }
            }
            tmp.sort((a, b) => a[0] - b[0]);
            // console.log(tmp);
            if (tmp.length >= 5) {
                let rp = getNicePar(0 - tmp[2][0]);
                if (rp > 1) {
                    tmp[0][0] = getRound(tmp[0][0], rp, 'down');
                    tmp[1][0] = getRound(tmp[1][0], rp);
                    tmp[0][1] = tmp[1][0] - 1;
                    tmp[2][0] = getRound(tmp[2][0], rp);
                    tmp[1][1] = tmp[2][0] - 1;
                    tmp[2][1] = getRound(tmp[2][1], rp);
                    tmp[3][0] = tmp[2][1] + 1;
                    tmp[3][1] = getRound(tmp[3][1], rp);
                    tmp[4][0] = tmp[3][1] + 1;
                    tmp[4][1] = getRound(tmp[4][1], rp, 'up');
                }
            }
            state.balanceInterval = tmp;
            if (debug) {
                console.log("balanceRange", state.balanceRange);
                console.log("balanceInterval", state.balanceInterval);
            }
        },
        changeYearRange(state, payload) {
            if (debug) {
                console.log("yearRange", payload)
            }
            state.yearRange = payload;
            state.infoYearRange = payload;
        },
        changeInfoYearRange(state, payload) {
            state.infoYearRange = payload;
        },
        changeAxisAngle(state, payload) {
            if (debug) {
                console.log("axisAngle", payload)
            }
            state.axisAngle = payload;
        },
        changeAxisLength(state, payload) {
            if (debug) {
                console.log("axisLength", payload)
            }
            state.axisLength = payload;
        },
        changeKernelWidth(state, payload) {
            if (debug) {
                console.log("kernel_width", payload)
            }
            state.kernel_width = payload;
        },
        changeTag(state, payload) {
            if (debug) {
                console.log("axisTag", payload)
            }
            state.axisTag = payload;
        }
    },
    actions: {},
    modules: {}
})