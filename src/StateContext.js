// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////
import React, {
  createContext,
  useEffect,
  useReducer,
  useState,
} from "react";

// Import Reducers
import gridReducer from "./reducer functions/gridReducer";
import talkyBlockyReducer from "./reducer functions/talkyBlockyReducer";

// Import helper functions
import useEventListener from './helper functions/useEventListener';

// CREATE CONTEXT ////////////////////////////////////////////////////////////////////////////////////
const StateContext = createContext();


function StateContextProvider(props) {
  // STATE //////////////////////////////////////////////////////////////////////////////////////////
  const [buildStage, setBuildStage] = useState(0);

  const [keywords, dispatchKeyWords] = useState([]);
  const [keywordsHistory, dispatchKeywordsHistory] = useState([]);

  const [grid, dispatchGrid] = useReducer(gridReducer, {});

  const [talkyBlocky, dispatchTalkyBlocky] = useReducer(talkyBlockyReducer, {});

  // SPEECH RECOGNITION API //////////////////////////////////////////////////////////////////////
  let recognition;

  function speechHandler (e) {
    if (e.results[0].isFinal) {
      const words = e.results[0][0].transcript.toLowerCase().split(" ");
      console.log(words);
    }
  }

  // Some hacky shit to actually get the API to not stop when the speaker pauses. 
  function continuouslyTranscribe() {
    recognition.start();
  }

  // KEY EVENTS //////////////////////////////////////////////////////////////////////////////

  function spaceBarDownHandler(e) {
    if (e.keyCode === 32) {
      console.log("yo")

      recognition.start();
    }
  }

  function spaceBarUpHandler(e) {
    if (e.keyCode === 32) {
      recognition.removeEventListener("end", continuouslyTranscribe);
      recognition.stop();
      document.addEventListener("keydown", spaceBarDownHandler, {once: true});
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
    }
    else if (buildStage === 2) {

      document.addEventListener("keydown", spaceBarDownHandler, {once: true});
      document.addEventListener("keyup", spaceBarUpHandler);

      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.addEventListener("result", speechHandler);
      recognition.addEventListener("end", continuouslyTranscribe);

      setBuildStage(3);
    }
  }, [buildStage]);

  // PROVIDE CONTEXT //////////////////////////////////////////////////////////////////////////////
  return (
    <StateContext.Provider value={{ grid, talkyBlocky }}>
      {props.children}
    </StateContext.Provider>
  );
}

// EXPORTS ///////////////////////////////////////////////////////////////////////////////////////
export default StateContext;
export { StateContextProvider };