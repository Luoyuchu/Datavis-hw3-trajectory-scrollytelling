import * as d3 from "d3";
import lodash from "lodash";

let basicRiver;
const timeInterval: [number, number, any][] = [
  [-602, 11, null],
  [11, 1048, null],
  [1048, 1128, null],
  [1128, 1368, null],
  [1368, 1855, null],
  [1855, 3000, null],
];

export async function loadYellowRiver() {
  basicRiver = await d3.json("geojson/grand_canal/yellow_river.geojson");
  for (let i of timeInterval) {
    const l = i[0];
    const r = i[1];
    const data = await d3.json(
      `geojson/grand_canal/yellow_river_${l}_${r}.geojson`
    );
    i[2] = data;
  }
}

export function getYellowRiverGeojsonByTime(year: number): any {
  const result = lodash.cloneDeep(basicRiver);
  for (let i of timeInterval) {
    if (year >= i[0] && year < i[1]) {
      result.features = result.features.concat(lodash.cloneDeep(i[2].features));
      return result;
    }
  }
  console.log(`get yellow river in ${year} error!`);
  return null;
}

export function getYellowRiverGeojsonByTime_changePart(year: number): any {
  for (let i of timeInterval) {
    if (year >= i[0] && year < i[1]) {
      return lodash.cloneDeep(i[2]);
    }
  }
  console.log(`get yellow river fragment in ${year} error!`);
  return null;
}

export function getYellowRiverStable(): any {
  return lodash.cloneDeep(basicRiver);
}
