import { OSMNode, OSMRelation, OSMWay } from "../types.js";
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

function getRandomNumber(): number {
  return Math.floor(Math.random() * 1001);
}

export const generateSafeStreetsQuery = (relationId: number) => `
  [out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["maxspeed"~"^(10|20|30})$"]["highway"]["access"!="private"];
  way(area.region)["highway"="living_street"][!"maxspeed"]["access"!="private"];
);
out geom;
`

/**
 * Excludes shared paths like prince alfred park
 */
export const generateDedicatedCyclewaysQuery = (relationId: number) => `
  [out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"~"cycleway"]["segregated"!="no"]["foot"!~"designated|yes"];
);
out geom;
`;

export const generateSharedPathsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"="footway"]["bicycle"="yes"];
  way(area.region)["highway"="cycleway"]["segregated"="no"];
way(area.region)["highway"="cycleway"][!"segregated"]["foot"~"yes|designated"];
);
out geom;
  `;


/**
 * includes living streets. doesn't include pedestrian malls or cycleways
 */
export const generateRoadsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"~"motorway|trunk|primary|secondary|tertiary|unclassified|residential|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|living_street|service"];
);
out geom;
  `;

export const generateOnRoadCycleLanes = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["cycleway"="lane"];
);
out geom;
  `;

export const generateRelationInfoQuery = (relationId: number) => `
[out:json][timeout:25];
relation(${relationId});
out tags;
`;


export async function cachedOverpassTurboRequest(input: string): Promise<any> {
    const hash = createHash('md5').update(input).digest('hex');
    const cachePath = path.join('./cache', `${hash}.json`);

    // Check if the cache file exists
    if (fs.existsSync(cachePath)) {
        // Read the cache file
        const data = fs.readFileSync(cachePath, 'utf-8');
        return JSON.parse(data);
    } else {
        // Generate new data
        const data = await overpassTurboRequest(input);

        // Save the data to cache
        fs.writeFileSync(cachePath, JSON.stringify(data), 'utf-8');
        
        return data;
    }
}

export async function overpassTurboRequest(request: string): Promise<(OSMNode | OSMWay | OSMRelation)[]> {
  const apiUrl = 'https://488e-103-85-36-185.ngrok-free.app/api/interpreter'
  // const apiUrl = 'https://overpass-api.de/api/interpreter';
  console.log("Started POST request...");

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: request,
  });

  if (!response.ok) {
    console.error(`Request: ${request}`);
    throw new Error(`Fetch error: ${response.statusText}`);
  }

  const textResponse = await response.text();
  try {
    const jsonResponse = JSON.parse(textResponse);
    return jsonResponse.elements as (OSMNode | OSMWay)[];
  } catch (e) {
    console.error(`Request: ${request}`);
    console.error(`Response: ${textResponse}`);
    throw new Error('Failed to parse response as JSON:' + e);
  }
}