import React, {
  createContext,
  useEffect,
  useReducer,
  useState,
} from "react";

// Import Reducers
import gridReducer from "./Reducer Functions/gridReducer";
import talkyBlockyReducer from "./Reducer Functions/talkyBlockyReducer";

// Import helper functions
import useEventListener from './helper functions/useEventListener';

const StateContext = createContext();

function StateContextProvider(props) {
  // STATE //////////////////////////////////////////////////////////////////////////////////////////
  const [buildStage, setBuildStage] = useState(0);

  // const [userSpeech, dispatchUserSpeech] = useReducer(userSpeechReducer, []);

  const [grid, dispatchGrid] = useReducer(gridReducer, {});

  const [talkyBlocky, dispatchTalkyBlocky] = useReducer(talkyBlockyReducer, {});

  // Webkit Speech Recognition ///////////////////////////////

  const [word, setWords] = useState([]);


  // useEventListener("result", listenToMic, recognition);

  function listenToMic(e) {
    console.log(e);

    if (e.results[0].isFinal) {
      setWords(e.results[0][0].transcript.toLowerCase().split(" "));
      console.log(e);
    }
  }

  // Listen Key ///////////////////////////////////////////////

  const [listenKeyDown, setListenKeyDown] = useState(false);

  function spaceBarDown(e) {
    if (e.keyCode === 32) {
      setListenKeyDown(true);
      // recognition.start();
    }
  }

  function spaceBarUp(e) {
    if (e.keyCode === 32) {
      setListenKeyDown(false);
      // recognition.stop();
      document.addEventListener("keydown", spaceBarDown, { once: true });
    }
  }

  // Initialize //////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (buildStage === 0) {
      dispatchGrid({ type: "BUILD_GRID" });
      dispatchGrid({
        type: "CHANGE_GRID_BLOCK_COLOR",
        position: [10, 5],
        rgb: "200,200,25"
      });
      setBuildStage(1);
    } else if (buildStage === 1) {
      dispatchTalkyBlocky({ type: "BUILD_TALKY_BLOCKY", grid: grid });
      setBuildStage(2);
    } else if (buildStage === 2) {
      document.addEventListener("keydown", spaceBarDown, { once: true });
      document.addEventListener("keyup", spaceBarUp);
      setBuildStage(3);
    } else if (buildStage === 3) {
      setBuildStage(4);
    }
    console.log();
  }, [buildStage]);

  return (
    <StateContext.Provider value={{ grid, talkyBlocky }}>
      {props.children}
    </StateContext.Provider>
  );
}

export default StateContext;
export { StateContextProvider };
