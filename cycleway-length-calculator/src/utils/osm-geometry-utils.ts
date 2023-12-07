import { OSMNode, OSMWay } from "../types";

function haversineDistance(coord1: { lat: number, lon: number }, coord2: { lat: number, lon: number }): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = degreesToRadians(coord2.lat - coord1.lat);
  const dLon = degreesToRadians(coord2.lon - coord1.lon);

  const lat1 = degreesToRadians(coord1.lat);
  const lat2 = degreesToRadians(coord2.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const km = R * c; // Distance in km
  // Returned in metres, rounded to 0 decimal places
  return Math.round(km * 1000);
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}


export function calculateWayLength(way: OSMWay): number {
  if(way.geometry.length < 2) {
    return 0;
  }
  let totalDistance = 0;
  let {lat: prevLat, lon: prevLon} = way.geometry[0];

  for(let i = 1; i < way.geometry.length; i++) {
    const {lat, lon} = way.geometry[i];
    const distance = haversineDistance({ lat: prevLat, lon: prevLon }, { lat: lat, lon: lon });
    prevLat = lat;
    prevLon = lon;
    totalDistance += distance;
  }
  return totalDistance;
}

export function getLengthOfAllWays(rawData: OSMWay[]): number {
  return rawData
    .map((element) => calculateWayLength(element as OSMWay))
    .reduce((a, b) => a + b, 0);
}