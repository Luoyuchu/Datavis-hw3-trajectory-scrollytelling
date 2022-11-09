import * as Geodata from "./dataloader/geodata";
import * as ChinaSouthSeaIslandsConstant from "./dataloader/chinaSouthSeaIslandsConstant";
import * as DynastyConstant from "./dataloader/dynastyConstant";
import * as Poet from "./dataloader/poet";
// import * as CBDBMigration from "./dataloader/CBDBMigration__";
import * as YellowRiver from "./dataloader/yellowRiver";

export {
  Poet,
  Geodata,
  DynastyConstant,
  ChinaSouthSeaIslandsConstant,
  // CBDBMigration,
  YellowRiver,
};

export async function loadData() {
  await Geodata.loadGeojson();
  // await CBDBMigration.loadMigrationData();
  await Poet.loadPoetData();
  await YellowRiver.loadYellowRiver();
}
