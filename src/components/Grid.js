// IMPORTS /////////////////////////////////////////////////////////////////////////
import React from "react";
import styled from "styled-components";

// Components
import GridBlock from "./GridBlock";

export default function Grid(props) {
  const grid = props.grid;

  const GridContainer = styled.div`
    position: absolute;
    left: 0px;
    top 0px;
    border: 5px solid white;
    display: inline-block;
  `;
  const gridRows = [];

  const GridRowContainer = styled.div`
    display: flex;
  `;

  let blockKey = 0;
  let gridRowKey = 0;

  for (
    let heightIndex = 0;
    heightIndex < grid.height;
    heightIndex++, gridRowKey++
  ) {
    const gridRowBlocks = [];
    for (
      let widthIndex = 0;
      widthIndex < grid.width;
      widthIndex++, blockKey++
    ) {
      gridRowBlocks[widthIndex] = (
        <GridBlock
          key={blockKey}
          size={grid.blockSize}
          color={grid.RGBs[widthIndex][heightIndex]}
        />
      );
    }
    gridRows[heightIndex] = (
      <GridRowContainer key={gridRowKey}>{gridRowBlocks}</GridRowContainer>
    );
  }

  return <GridContainer>{gridRows}</GridContainer>;
}
