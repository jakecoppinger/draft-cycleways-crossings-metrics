import React, { useEffect, useState } from "react";
import "../App.css";
import { GeneratedCouncilData } from "../types";
import dataByCouncil from "../data/data-by-council.json";
import { LinkToOverpassQuery } from "../components/LinkToOverpassQuery";

export const IndexPageComponent = () => {
  return (
    <div>
      <h1>Hello!</h1>
      <CouncilTable dataByCouncil={dataByCouncil}></CouncilTable>
    </div>
  );
};


const CouncilTable = ({
  dataByCouncil,
}: {
  dataByCouncil: GeneratedCouncilData[];
}) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Council name</th>
          <th>Shared + dedicated cycleways + safe roads / roads (%)</th>
          <th>Dedicated cycleways length / roads (%)</th>
          <th>Surface roads (non-offramp/link) (km)</th>
          <th>{'Safe strets (<=30kmh) (km)'}</th>
          <th>Dedicated cycleways (km)</th>
          <th>Shared paths (km)</th>
          <th>On road lanes ("dooring lane") (km)</th>
          <th>Under construction cycleways (km)</th>
          <th>Proposed cycleways (km)</th>
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

const CouncilTableRow = ({ row }: { row: GeneratedCouncilData }) => {
  const {
    // relationInfoQuery,
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
    safePathsToRoadsRatio,
    underConstructionCyclewaysLength,
    underConstructionCyclewaysQuery,
    proposedCyclewaysLength,
    proposedCyclewaysQuery,
    safeStreetsLength,
    safeStreetsQuery,
    wikipedia
  } = row;

  return (
    <tr>
      <td>
        {/* <LinkToOverpassQuery queryStr={relationInfoQuery}> */}
          {councilName}{" "}
        {/* </LinkToOverpassQuery>{" "} */}
        {wikipedia ? <WikipediaLink articleName={wikipedia}>(Wikipedia)</WikipediaLink> : null}
      
      </td>

      <td>{formatRatio(safePathsToRoadsRatio)}</td>
      <td>{formatRatio(cyclewaysToRoadsRatio)}</td>

      <td>
        <LinkToOverpassQuery queryStr={roadsQuery}>
          {formatLengthInKm(roadsLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={safeStreetsQuery}>
          {formatLengthInKm(safeStreetsLength)}
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
      <td>
        <LinkToOverpassQuery queryStr={underConstructionCyclewaysQuery}>
          {formatLengthInKm(underConstructionCyclewaysLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={proposedCyclewaysQuery}>
          {formatLengthInKm(proposedCyclewaysLength)}
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

/** Takes an area in square metres and formats it in square kilometres  */
function formatArea(areaInSquareMetres: number): string {
  return `${(areaInSquareMetres / 1000000).toFixed(1)} km²`;
}
function WikipediaLink({ articleName, children }: { articleName: string, children: React.ReactNode }) {
  return (
    <a
      href={`https://en.wikipedia.org/wiki/${articleName}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}