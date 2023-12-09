import {
  cachedOverpassTurboRequest, generateDedicatedCyclewaysQuery,
  generateOnRoadCycleLanes, generateProposedCyclewaysQuery, generateRelationInfoQuery, generateRelationPointsQuery, generateRoadsQuery, generateSharedPathsQuery, generateUnderConstructionCyclewaysQuery,
} from "./api/overpass.js";
import { GeneratedCouncilData, OSMNode, OSMRelation, OSMWay } from "./types.js";
import { getLengthOfAllWays } from "./utils/osm-geometry-utils.js";
import * as turf from '@turf/turf';

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

async function generateCouncilArea(relationId: number): Promise<number> {
  const relationPoints = await cachedOverpassTurboRequest(generateRelationPointsQuery(relationId)) as (OSMNode | OSMWay)[];
  const coords = (relationPoints
  .filter((node) => node.type === 'node') as OSMNode[])
    .filter((node) => {
      if (node.lat && node.lon) {
        return true
      } else {
        console.log(`Node ${node.id} is missing lat or lon`);
        return false
      }
      })
    .map((node) => [node.lon, node.lat])
  coords.push(coords[0]);
  const polygon = turf.polygon([coords]);
  const councilArea = turf.area(polygon);
  return councilArea;
}
async function main() {

  let dataByCouncil: any = [];
  for (let i = 0; i < councilOsmRelationIds.length; i++) {
    const relationId = councilOsmRelationIds[i];

    const councilArea = await generateCouncilArea(relationId);

    const relationInfoQuery = generateRelationInfoQuery(relationId);
    const relationInfo = (await cachedOverpassTurboRequest(relationInfoQuery))[0] as OSMRelation;
    const councilName = relationInfo.tags.name || '(area missing name)';

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


    const underConstructionCyclewaysQuery = generateUnderConstructionCyclewaysQuery(relationId);
    const underConstructionCyclewaysLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(underConstructionCyclewaysQuery) as OSMWay[]
    )

    const proposedCyclewaysQuery = generateProposedCyclewaysQuery(relationId);
    const proposedCyclewaysLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(proposedCyclewaysQuery) as OSMWay[]
    )


    const cyclewaysToRoadsRatio = dedicatedCyclewaysLength / roadsLength;
    const sharedAndCyclewaysToRoadsRatio = (dedicatedCyclewaysLength + sharedPathsLength) / roadsLength;

    // const waysLength = generateWayLengthLookup(rawData);
    // const waysStats = generateWayLengthStats(rawData, waysLength);

    const generatedCouncilData: GeneratedCouncilData = {
      councilName, relationId, dedicatedCyclewaysLength, roadsLength,
      onRoadCycleLanesLength, sharedPathsLength,
      dedicatedCyclewaysQuery, roadsQuery, onRoadCycleLanesQuery, sharedPathsQuery, relationInfoQuery,
      cyclewaysToRoadsRatio, sharedAndCyclewaysToRoadsRatio, councilArea,
      underConstructionCyclewaysQuery, underConstructionCyclewaysLength, proposedCyclewaysLength, proposedCyclewaysQuery
    };

    dataByCouncil.push(generatedCouncilData);
  }

  const jsonRelativeOutputPath = '../cycleway-length-calculator/src/data/'
  await saveObjectToJsonFile(
    dataByCouncil,
    `${jsonRelativeOutputPath}data-by-council.json`,
  );
  console.log("Saved data-by-council.json");
}
main();