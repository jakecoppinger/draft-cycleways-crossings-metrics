export interface OSMWay {
  type: "way",
  id: number,
  nodes: number[],
  geometry: { lat: number, lon: number }[],
  tags: {
    highway?: string,
    maxspeed?: string,
    lanes?: string,
    lit?: string,
    name?: string,
    oneway?: string,
    sidewalk?: string,
    source?: string,
    width?: string,
    bicycle?: string,
    surface?: string,
  },

  bounds: {
    minlat: number,
    minlon: number,
    maxlat: number,
    maxlon: number,
  }
}

export interface OSMNode {
  type: "node",
  id: number,
  lat: number,
  lon: number,
  tags: {
  },
}