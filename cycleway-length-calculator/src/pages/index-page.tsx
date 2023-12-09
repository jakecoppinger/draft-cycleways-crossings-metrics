import React, { useEffect, useState } from "react";
import "../App.css";
import { cycleways, overpassTurboRequest, safeStreets } from "../api/overpass";
import { OSMWay } from "../types";
import { WayLengthStat, generateWayLengthLookup, generateWayLengthStats, getLengthOfAllWays } from "../utils/osm-geometry-utils";



export const IndexPageComponent = () => {
  const [rawData, setRawData] = useState<OSMWay[]>([]);
  const [wayStats, setWayStats] = useState<WayLengthStat[]>([]);
  const [totalLength, setTotalLength] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      const overpassQuery = cycleways(1251066);
      const rawData = await overpassTurboRequest(overpassQuery) as OSMWay[];
      const waysLength = generateWayLengthLookup(rawData);

      const waysStats = generateWayLengthStats(rawData, waysLength);
      setWayStats(waysStats);

      const l = getLengthOfAllWays(rawData);
      setTotalLength(l);
      console.log(l);
      setRawData(rawData);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Hello!</h1>
      <h2>Total length: {totalLength}</h2>
      <h3>Ways stats:</h3>
      <p>{JSON.stringify(wayStats, null, 2)}</p>
      <h1>Raw data</h1>
      <p>{JSON.stringify(rawData, null, 2)}</p>
    </div>
  );
};
