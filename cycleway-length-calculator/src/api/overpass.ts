import { OSMNode, OSMWay } from "../types";


function getRandomNumber(): number {
  return Math.floor(Math.random() * 1001);
}


export const safeStreets = (relationId: number) => `
  [out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["maxspeed"~"^(10|20|30|${getRandomNumber()
  })$"]["highway"]["access"!="private"];
  way(area.region)["highway"="living_street"][!"maxspeed"]["access"!="private"];
);
out geom;

`

export async function overpassTurboRequest(request: string): Promise<(OSMNode | OSMWay)[]> {
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
    throw new Error(`Fetch error: ${response.statusText}`);
  }

  try {
    const jsonResponse = await response.json();
    return jsonResponse.elements as (OSMNode | OSMWay)[];
  } catch (e) {
    throw new Error('JSON parse error:' + e);
  }
}
