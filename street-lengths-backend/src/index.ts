import {
  cachedOverpassTurboRequest, generateDedicatedCyclewaysQuery,
  generateOnRoadCycleLanes, generateRelationInfoQuery, generateRoadsQuery, generateSharedPathsQuery,
} from "./api/overpass.js";
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

const councilOsmRelationIds =
  [
    1251066, // City of sydney
    2404870, // city of melbourne
    6201664, // randwick
    6217271, // city of canada bay
  ]

async function main() {

  let dataByCouncil: any = [];
  for (let i = 0; i < councilOsmRelationIds.length; i++) {
    const relationId = councilOsmRelationIds[i];


    const relationInfo = (await cachedOverpassTurboRequest(generateRelationInfoQuery(relationId)))[0] as OSMRelation;
    const councilName = relationInfo.tags.name;

    const dedicatedCyclewaysQuery = generateDedicatedCyclewaysQuery(relationId)
    const dedicatedCyclewaysLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(dedicatedCyclewaysQuery) as OSMWay[]
    )
    const roadsQuery = generateRoadsQuery(relationId)
    const roadsLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(roadsQuery) as OSMWay[]
    )
    const onRoadCycleLanesQuery = generateOnRoadCycleLanes(relationId)
    const onRoadCycleLanesLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(onRoadCycleLanesQuery) as OSMWay[]
    )
    const sharedPathsQuery = generateSharedPathsQuery(relationId)
    const sharedPathsLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(sharedPathsQuery) as OSMWay[]
    )
    
    // const waysLength = generateWayLengthLookup(rawData);
    // const waysStats = generateWayLengthStats(rawData, waysLength);


    dataByCouncil.push({
      councilName, relationId, dedicatedCyclewaysLength, roadsLength,
      onRoadCycleLanesLength, sharedPathsLength, dedicatedCyclewaysQuery, roadsQuery, onRoadCycleLanesQuery, sharedPathsQuery
    });
  }

  const jsonRelativeOutputPath = '../cycleway-length-calculator/src/data/'
  await saveObjectToJsonFile(
    dataByCouncil,
    `${jsonRelativeOutputPath}data-by-council.json`,
  );
  console.log("Saved data-by-council.json");
}
main();