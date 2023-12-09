import * as turf from '@turf/turf';
import * as fs from 'fs';

import {
  cachedOverpassTurboRequest
} from "./api/overpass.js";

import {
  generateDedicatedCyclewaysQuery,
  generateAllCouncilsQuery,
  generateOnRoadCycleLanes, generateProposedCyclewaysQuery, generateRelationInfoQuery, generateRelationPointsQuery, generateRoadsQuery, generateSafeStreetsQuery, generateSharedPathsQuery, generateUnderConstructionCyclewaysQuery, generateOnewayRoadsQuery, generateBidiectionalRoadsQuery,
} from "./utils/overpass-queries.js";

import { GeneratedCouncilData, OSMNode, OSMRelation, OSMWay } from "./types.js";
import { getLengthOfAllWays } from "./utils/osm-geometry-utils.js";


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


async function generateRoadsLength(relationId: number): Promise<number> {
  const onewayRoads = await cachedOverpassTurboRequest(generateOnewayRoadsQuery(relationId)) as OSMWay[];
  const bidirectionalRoads = await cachedOverpassTurboRequest(generateBidiectionalRoadsQuery(relationId)) as OSMWay[];
  return (getLengthOfAllWays(onewayRoads) / 2) + getLengthOfAllWays(bidirectionalRoads);
}


async function main() {
  // NSW: 2316593
  const nswRelationId = 2316593;
  const australiaRelationId = 80500;
  const allCouncilsQuery = generateAllCouncilsQuery(australiaRelationId);
  const allCouncilRaw = await cachedOverpassTurboRequest(allCouncilsQuery) as OSMRelation[];
  const allCouncils = allCouncilRaw.map(
    (relation) => ({ relationId: relation.id, name: relation.tags.name, wikipedia: relation.tags.wikipedia, wikidata: relation.tags.wikidata }))
    .filter((council) => council.relationId === 1251066);
  

  let dataByCouncil: any = [];
  for (let i = 0; i < allCouncils.length; i++) {
    const council = allCouncils[i];
    const {relationId, wikipedia, wikidata } = council;
    const wikidataPopulation: number | null = wikidata
      ? await getPopulation(wikidata) || null
      : null;

    const councilArea = await generateCouncilArea(relationId);

    const relationInfoQuery = generateRelationInfoQuery(relationId);
    const relationInfo = (await cachedOverpassTurboRequest(relationInfoQuery))[0] as OSMRelation;
    const councilName = relationInfo.tags.name || '(area missing name)';

    const dedicatedCyclewaysQuery = generateDedicatedCyclewaysQuery(relationId)
    const dedicatedCyclewaysLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(dedicatedCyclewaysQuery) as OSMWay[]
    )
    const roadsQuery = generateRoadsQuery(relationId)
    const roadsLength = await generateRoadsLength(relationId);

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

    const safeStreetsQuery = generateSafeStreetsQuery(relationId);
    const safeStreetsLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(safeStreetsQuery) as OSMWay[]
    )


    const cyclewaysToRoadsRatio = roadsLength > 0 
      ? dedicatedCyclewaysLength / roadsLength : null;
    const safePathsToRoadsRatio = roadsLength > 0
      ? (dedicatedCyclewaysLength + sharedPathsLength + safeStreetsLength) / roadsLength
      : null;


    // const waysLength = generateWayLengthLookup(rawData);
    // const waysStats = generateWayLengthStats(rawData, waysLength);

    const generatedCouncilData: GeneratedCouncilData = {
      councilName, relationId, dedicatedCyclewaysLength, roadsLength,
      onRoadCycleLanesLength, sharedPathsLength,
      dedicatedCyclewaysQuery, roadsQuery, onRoadCycleLanesQuery, sharedPathsQuery,
      // , relationInfoQuery,
      cyclewaysToRoadsRatio, safePathsToRoadsRatio, councilArea,
      underConstructionCyclewaysQuery, underConstructionCyclewaysLength, proposedCyclewaysLength, proposedCyclewaysQuery,
      safeStreetsQuery, safeStreetsLength,wikipedia, wikidata, wikidataPopulation
    };

    dataByCouncil.push(generatedCouncilData);
  }

  const jsonRelativeOutputPath = '../cycleway-length-calculator/src/data/'

  const sortedDataByCouncil = dataByCouncil.sort((a: any, b: any) => {
    return b.cyclewaysToRoadsRatio - a.safePathsToRoadsRatio;
  });

  await saveObjectToJsonFile(
    sortedDataByCouncil,
    `${jsonRelativeOutputPath}data-by-council.json`,
  );
  console.log("Saved data-by-council.json");
}
main();

// import fetch from 'node-fetch';

async function getPopulation(wikidataId: string): Promise<number | null> {
    const endpointUrl = 'https://query.wikidata.org/sparql';
    const sparqlQuery = `
    SELECT ?population WHERE {
        wd:${wikidataId} wdt:P1082 ?population.
    } ORDER BY DESC(?population)
    LIMIT 1`;

    const url = endpointUrl + '?query=' + encodeURIComponent(sparqlQuery) + '&format=json';

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'YourApp/1.0 (http://example.com/YourApp)',
                'Accept': 'application/sparql-results+json'
            }
        });

        const json = await response.json();
        const population = json.results.bindings[0]?.population.value;

        return population ? parseInt(population) : null;
    } catch (error) {
        console.error('Error fetching population data:', error);
        return null;
    }
}

// const wikidataId = 'Q1748'; // Wikidata ID for Copenhagen
// getPopulation(wikidataId).then(population => {
//     if (population !== null) {
//         console.log(`Population of Copenhagen: ${population}`);
//     } else {
//         console.log('Population data not found.');
//     }
// });
