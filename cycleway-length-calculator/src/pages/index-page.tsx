import React, { useEffect, useState } from "react";
import "../App.css";
import { CouncilRow } from "../types";
import dataByCouncil from "../data/data-by-council.json";
import { LinkToOverpassQuery } from "../components/LinkToOverpassQuery";

// sort by which councils have highest ratio of cycleable paths to roads
const orderedDataByCouncil = dataByCouncil.sort((a, b) => {
  return b.sharedAndCyclewaysToRoadsRatio - a.sharedAndCyclewaysToRoadsRatio;
});
export const IndexPageComponent = () => {
  // const [totalLength, setTotalLength] = useState<number>(0);

  // useEffect(() => {
  //   async function fetchData() {
  //   }
  //   fetchData();
  // }, []);

  return (
    <div>
      <h1>Hello!</h1>
      <CouncilTable dataByCouncil={orderedDataByCouncil}></CouncilTable>
    </div>
  );
};

const CouncilTable = ({ dataByCouncil }: { dataByCouncil: CouncilRow[] }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Council name</th>
          <th>Shared and dedicated paths length / roads (%)</th>
          <th>Dedicated cycleways length / roads (%)</th>
          <th>Roads (km)</th>
          <th>Dedicated cycleways (km)</th>
          <th>Shared paths (km)</th>
          <th>On road lanes ("dooring lane") (km)</th>
        </tr>
      </thead>
      <tbody>
        {dataByCouncil.map((row) => (
          <CouncilTableRow key={row.relationId} row={row} />
        ))}
      </tbody>
    </table>
  );
};

const CouncilTableRow = ({ row }: { row: CouncilRow }) => {
  const {
    relationInfoQuery,
    councilName,
    dedicatedCyclewaysLength,
    dedicatedCyclewaysQuery,
    roadsLength,
    roadsQuery,
    sharedPathsLength,
    sharedPathsQuery,
    onRoadCycleLanesQuery,
    onRoadCycleLanesLength,

  cyclewaysToRoadsRatio,
  sharedAndCyclewaysToRoadsRatio
  } = row;

  return (
    <tr>
      <td>
        <LinkToOverpassQuery queryStr={relationInfoQuery}>
          {councilName}
        </LinkToOverpassQuery>
      </td>
      <td>
          {formatRatio(sharedAndCyclewaysToRoadsRatio)}
      </td>
      <td>
          {formatRatio(cyclewaysToRoadsRatio)}
      </td>

      <td>
        <LinkToOverpassQuery queryStr={roadsQuery}>
          {formatLengthInKm(roadsLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={dedicatedCyclewaysQuery}>
          {formatLengthInKm(dedicatedCyclewaysLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={sharedPathsQuery}>
          {formatLengthInKm(sharedPathsLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={onRoadCycleLanesQuery}>
          {formatLengthInKm(onRoadCycleLanesLength)}
        </LinkToOverpassQuery>
      </td>
    </tr>
  );
};

function formatLengthInKm(lengthInMetres: number): string {
  return `${(lengthInMetres / 1000).toFixed(2)}`;
}

function formatRatio(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}