import React, { useEffect, useState } from "react";
import "../App.css";
import { overpassTurboRequest, safeStreets } from "../api/overpass";
import { OSMWay } from "../types";
import { getLengthOfAllWays } from "../utils/osm-geometry-utils";


export const IndexPageComponent = () => {
  const [slowRoads, setSlowRoads] = useState<any>({});

  useEffect(() => {
    async function fetchData() {
      const query = safeStreets(1251066);
      const rawData = await overpassTurboRequest(query) as OSMWay[];
      const l = getLengthOfAllWays(rawData);
      console.log(l);

      setSlowRoads(rawData);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Hello!</h1>
      <p>{JSON.stringify(slowRoads, null, 2)}</p>
    </div>
  );
};
