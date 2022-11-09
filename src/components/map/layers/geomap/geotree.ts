import { Point } from "@/utils/geometry";
import * as Geometry from "@/utils/geometry";
import * as Data from "@/data";
import * as d3 from "d3";

export class GeoTreeNode {
  name: string;
  aid: number;

  feature: Data.Geodata.GeojsonFeatureType;
  centroid: Point;
  area: number;

  father: GeoTreeNode;
  children: Array<GeoTreeNode>;

  constructor(name: string) {
    this.name = name;
    this.father = null;
    this.children = [];
  }
}

export class GeoTree {
  nodes: Array<GeoTreeNode>;
  root: GeoTreeNode;

  buildTree(adtree: Data.Geodata.ADTreeType, lazy: boolean = false) {
    function dfs(p: GeoTreeNode, adtree: Data.Geodata.ADTreeType): void {
      let n = new GeoTreeNode(adtree.name);
      n.centroid = new Point(adtree.center[0], adtree.center[1]);
      n.aid = adtree.id;
      n.feature = Data.Geodata.getFeatureByAid(n.aid);
      if (n.feature) {
        n.area = Geometry.calcFeatureArea(n.feature);
      }
      n.father = p;
      p.children.push(n);
      for (let c of adtree.children) {
        dfs(n, c);
      }
    }
    this.root = new GeoTreeNode("world");
    dfs(this.root, adtree);
  }

  constructor(adtree: Data.Geodata.ADTreeType, lazy: boolean = false) {
    this.buildTree(adtree, lazy);
    console.log(this.root);
  }

  checkContain(p: Point): GeoTreeNode {
    function dfsCheck(cur: GeoTreeNode) {
      const det = [
        new Point(0.001, 0.001),
        new Point(0.001, -0.001),
        new Point(-0.001, 0.001),
        new Point(-0.001, -0.001),
      ];
      for (let i of cur.children) {
        // let flag = false;
        let flag = Geometry.checkPointInsideFeature(i.feature, p);
        for (let j = 0; j < 4; ++j) {
          flag ||= Geometry.checkPointInsideFeature(i.feature, p.add(det[j]));
        }
        if (flag) {
          return dfsCheck(i);
        }
      }
      return cur;
    }
    const cn: GeoTreeNode = this.root.children[0];
    /*
            Todo: 
            1. add geometry for the whole china.
         */
    const result = dfsCheck(cn);
    if (result === cn) {
      return this.root;
    }
    return result;
  }
}
