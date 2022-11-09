import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Point } from "@/utils/geometry";
import { stackOrderNone } from "d3";
import yangtzeGeojson from "../../assets/data/simple_yangtze.json";
import neighborAreaGeojson from "@/assets/data/neighborarea.json";

export type ADTreeType = {
  name: string;
  id: number;
  center: [number, number];
  children: Array<ADTreeType>;
};

export type GeojsonFeatureType = {
  type: string;
  geometry: {
    type: "Polygon" | "MultiPolygon" | "LineString" | "MultiLineString";
    coordinates:
      | Array<Array<[number, number]>>
      | Array<Array<Array<[number, number]>>>
      | [number, number][];
  };
  properties: {
    name: string;
    id: number;
  };
};

let chinaGeojson;
let chinaADTree: ADTreeType;
let chinaInlineSouthSeaGeojson;
let chinaSouthSeaGeojson;
// let neighborAreaGeojson;
// let yangtzeGeojson;
let provinceGeojson = {};
let provinceGeojsonAidDict = {};

/* Baisc information of China map */
let mapCenter = [107, 31];
let mapBorder = [14.39, 55.8, 72.72, 135.12]; // 上0，下1，左2，右3
let axisOrigin = [115.91, 31.38];

function calcProvinceCenter() {
  for (let i of chinaGeojson.features) {
    let centroid: Point = new Point(0, 0);
    let weight: number = 0;
    for (let j of getPolygons(i)) {
      let curCentroid: Point = new Point(...d3.polygonCentroid(j));
      let curWeight: number = d3.polygonArea(j);
      let c1 = centroid.mul(weight / (curWeight + weight));
      let c2 = curCentroid.mul(curWeight / (curWeight + weight));
      centroid = c1.add(c2);
    }
    if (i.properties.name === "甘肃省") {
      centroid[0] += 2;
    }
    if (i.properties.name === "河北省") {
      centroid[1] -= 1;
    }
    i.properties.cp = centroid;
  }
}

export async function loadGeojson() {
  chinaADTree = await d3.json("geojson/china_AD_tree_simple.json");
  chinaGeojson = await d3.json("geojson/china.json");
  // chinaGeojson = topojson.feature(chinaTopojson, 'quanguo');
  calcProvinceCenter();
  chinaInlineSouthSeaGeojson = await d3.json("geojson/inlinesouthsea.json");
  chinaSouthSeaGeojson = await d3.json("geojson/southsea.json");
  // neighborAreaGeojson = await d3.json("geojson/neighborarea.json");
  // yangtzeGeojson = await d3.json("geojson/simple_yangtze.geojson");
  const provincesGeometry = await d3.json(
    "geojson/provincesGeometryMerged.json"
  );
  for (let i of chinaGeojson.features) {
    // provinceGeojson[i.properties.name] = await d3.json(`geojson/chinaGeometryProvince/${i.properties.district_code.slice(0, 2)}.json`);
    // provinceGeojson[i.properties.name] = await d3.json(`geojson/chinaGeometryProvince/${i.properties.id}.json`);
    provinceGeojson[i.properties.name] = provincesGeometry[i.properties.id];
    provinceGeojsonAidDict[i.properties.id] =
      provinceGeojson[i.properties.name];
  }
}

export function getFeatureByAid(aid: number): GeojsonFeatureType {
  function idFormatter(id: number) {
    return +(id.toString() + "0".repeat(6 - id.toString().length));
  }
  let provinceId = Math.floor(aid / 10000);
  if (aid % 10000 === 0) {
    for (let i of chinaGeojson.features) {
      if (i.properties.id == provinceId) {
        return i;
      }
    }
  } else {
    for (let i of provinceGeojsonAidDict[provinceId].features) {
      if (aid == idFormatter(i.properties.id)) {
        return i;
      }
    }
  }
  return null;
}

export function getChinaADTree(): ADTreeType {
  return chinaADTree;
}

export function getChinaGeojson() {
  return chinaGeojson;
}

export function getChinaInlineSouthSeaGeojson() {
  return chinaInlineSouthSeaGeojson;
}

export function getChinaSouthSeaGeojson() {
  return chinaSouthSeaGeojson;
}

export function getNeighborAreaGeojson() {
  return neighborAreaGeojson;
}

export function getYangtzeGeojson() {
  return yangtzeGeojson;
}

export function getPolygon(feature) {
  if (feature.geometry.type === "Polygon") {
    return feature.geometry.coordinates[0];
  } else if (feature.geometry.type === "MultiPolygon") {
    return feature.geometry.coordinates[0][0];
  } else {
    throw Error("getPolygon failed");
  }
}

export function getPolygons(feature) {
  if (feature.geometry.type === "Polygon") {
    return feature.geometry.coordinates;
  } else if (feature.geometry.type === "MultiPolygon") {
    return feature.geometry.coordinates[0];
  } else {
    throw Error("getPolygon failed");
  }
}

export function getProvinceGeojson(name) {
  return provinceGeojson[name];
}
