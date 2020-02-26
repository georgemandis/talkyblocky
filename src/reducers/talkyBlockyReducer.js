export default function talkyBlockyReducer(talkyBlocky, action) {
  switch(action.type) {
    case "BUILD_TALKY_BLOCKY":
      const size = (action.grid.blockSize - (action.grid.blockSize / 4))
      const initialOffset = Math.floor((action.grid.blockSize / 20) + (action.grid.blockSize / 2) - (size / 2));
      return {
        size: size,
        left: initialOffset,
        top: initialOffset,
        gridPos: [0, 0]
      }     

    case "MOVE_TALKY_BLOCKY":
      if (action.direction === "left") {
        if (talkyBlocky.gridPos[0] > 0) {
          talkyBlocky.left -= 100;
          talkyBlocky.gridPos[0] -= 1;
        }
      }
      else if (action.direction === "right") {
        if (talkyBlocky.gridPos[0] < action.grid.width - 1) {
          talkyBlocky.left += 100;
          talkyBlocky.gridPos[0] += 1;
        }
      }
      else if (action.direction === "down") {
        if (talkyBlocky.gridPos[1] < action.grid.height - 1) {
          talkyBlocky.top += 100;
          talkyBlocky.gridPos[1] += 1;
        }
      }
      else if (action.direction === "up" ) {
        if (talkyBlocky.gridPos[1] > 0) {
          talkyBlocky.top -= 100;
          talkyBlocky.gridPos[1] -= 1;
        }
      }
      return talkyBlocky;
  }
}