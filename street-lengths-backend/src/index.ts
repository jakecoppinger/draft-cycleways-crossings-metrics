import { cachedOverpassTurboRequest, cyclewaysQuery, overpassTurboRequest, relationInfoQuery } from "./api/overpass.js";
import { OSMRelation, OSMWay } from "./types.js";
import { generateWayLengthLookup, generateWayLengthStats, getLengthOfAllWays } from "./utils/osm-geometry-utils.js";

import * as fs from 'fs';

/**
 * Function that takes an object and saves it to a JSON file.
 */
async function saveObjectToJsonFile(object: any, fileName: string) {
  const writeFile = fs.promises.writeFile;
  const jsonString = JSON.stringify(object, null, 2);
  await writeFile(fileName, jsonString);
}

const jsonRelativeOutputPath = '../cycleway-length-calculator/src/data/'
const councilOsmRelationIds =
  [
    1251066, // City of sydney
    2404870, // city of melbourne
    6201664, // randwick
    6217271, // city of canada bay
  ]

async function main() {

  let dataByCouncil: any  = [];
  for(let i = 0; i < councilOsmRelationIds.length; i++) {
      const relationId = councilOsmRelationIds[i];


      const relationInfo = (await cachedOverpassTurboRequest(relationInfoQuery(relationId)))[0] as OSMRelation;
      const councilName = relationInfo.tags.name;



      const overpassQuery = cyclewaysQuery(relationId);
      const rawData = await cachedOverpassTurboRequest(overpassQuery) as OSMWay[];

      // const waysLength = generateWayLengthLookup(rawData);

      // const waysStats = generateWayLengthStats(rawData, waysLength);

      const lenthAllWays = getLengthOfAllWays(rawData);

      dataByCouncil.push({ councilName, relationId, lenthAllWays });
    }

    console.log(dataByCouncil);
  // await saveObjectToJsonFile(
  //   rawData,
  //   `${jsonRelativeOutputPath}rawData.json`,
  // );

  // console.log(l);
}
main();