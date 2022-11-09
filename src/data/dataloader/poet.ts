import * as d3 from "d3";
import axios from "axios";
import * as XLSX from "xlsx";

export type TrajectoryType = {
  id: number;
  x_coord: number;
  y_coord: number;
  name: string;
  year: [number, number] | number;
  time: [number, number];
  detail: Array<string>;
};

export type PoetType = {
  dynasty: string;
  lifetime: [number, number];
  name: string;
  trajectory: Array<TrajectoryType>;
};

let personData = null;

export async function loadPoetData() {
  personData = await parseFile("trajectory.xlsx");
  personData = processData(personData);
}

export function getData() {
  return personData;
}

export function processData(data) {
  const trajectory = data.trajectory;
  let cnt = 0;
  for (let j of trajectory) {
    j.id = cnt;
    cnt += 1;
    // [j.x_coord, j.y_coord] = [j.y_coord, j.x_coord];
    if (j.year instanceof Array) {
      j.time = [j.year[0], j.year[1]];
    } else {
      j.time = [j.year, j.year];
    }
  }
  trajectory.sort((a, b) => a.time[0] - b.time[0]);
  for (let i of trajectory) {
    i.time[1] += 1;
  }
  return data;
}

async function readFile(filePath) {
  const resp = await fetch(filePath);
  return await resp.arrayBuffer();
}

async function parseFile(filePath): any {
  const getPersonInfoWorksheet = (worksheet) => {
    const attrs = ["name", "dynasty", "birth", "death", "info", "contributor"];
    const data = {};
    for (let i = 0; i < attrs.length; ++i) {
      data[attrs[i]] = worksheet[`B${i + 1}`].v;
    }
    data.lifetime = [data.birth, data.death];
    return data;
  };
  const getTrajectoryWorksheet = (worksheet) => {
    const attrs = [
      "index",
      "x_coord",
      "y_coord",
      "name",
      "time_start",
      "time_end",
      "detail",
    ];
    const cols = ["B", "C", "D", "E", "F", "G", "H"];
    const trajectory = [];
    for (let i = 1; ; ++i) {
      const iv = worksheet[`B${i + 7}`]?.v;
      if (!((typeof iv === "string" || typeof iv === "number") && iv !== "")) {
        break;
      }
      const item = {};
      for (let j = 0; j < attrs.length; ++j) {
        if (
          (attrs[j] === "time_start" || attrs[j] === "time_end") &&
          worksheet[`${cols[j]}${i + 7}`]?.t === "n" &&
          worksheet[`${cols[j]}${i + 7}`]?.w.match(/\d+\/\d+\/\d\d/)
        ) {
          const d = new Date("1900-1-1");
          const formater = d3.timeFormat("%Y/%m/%d");
          const det = +worksheet[`${cols[j]}${i + 7}`]?.v;
          item[attrs[j]] = formater(
            d.setDate(d.getDate() + det - 1 - (det >= 60))
          );
        } else {
          item[attrs[j]] = worksheet[`${cols[j]}${i + 7}`]?.v;
        }
      }
      item.year = [item.time_start, item.time_end];
      let blankFlag = true;
      for (let j of attrs.slice(1)) {
        if (!!item[j]) {
          blankFlag = false;
        }
      }
      if (!blankFlag) {
        trajectory.push(item);
      }
    }
    return trajectory;
  };

  const dataArrayBuffer = await readFile(filePath);
  const workbook = XLSX.read(dataArrayBuffer);
  const sheetNames = workbook.SheetNames;
  const worksheet = workbook.Sheets[sheetNames[0]];
  const dataPersonInfo = getPersonInfoWorksheet(worksheet);
  const dataTrajectory = getTrajectoryWorksheet(worksheet);
  return { ...dataPersonInfo, trajectory: dataTrajectory };
}
