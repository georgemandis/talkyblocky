const gridBlockSize = 100;
const gridWidth = Math.floor(window.innerWidth / gridBlockSize);
const gridHeight = Math.floor(window.innerHeight / gridBlockSize);
const gridRGBs = [];

export default function gridReducer(grid, action) {
  switch (action.type) {
    case "BUILD_GRID":
      for (let widthIndex = 0; widthIndex < gridWidth; widthIndex++) {
        const gridColumn = [];
        for (let heightIndex = 0; heightIndex < gridHeight; heightIndex++) {
          gridColumn[heightIndex] = "255, 255, 255";
        }
        gridRGBs[widthIndex] = gridColumn;
      }

      return {
        blockSize: gridBlockSize,
        width: gridWidth,
        height: gridHeight,
        RGBs: gridRGBs
      };

    case "CHANGE_GRID_BLOCK_COLOR":
      grid.RGBs[action.position[0]][action.position[1]] = action.rgb;

      return grid;
  }
}
