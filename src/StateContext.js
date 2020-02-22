// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////
import React, { createContext, useEffect, useReducer, useState } from "react";

// Import Reducers
import gridReducer from "./reducer functions/gridReducer";
import talkyBlockyReducer from "./reducer functions/talkyBlockyReducer";

// Import helper functions
import useEventListener from "./helper functions/useEventListener";

// CREATE CONTEXT ////////////////////////////////////////////////////////////////////////////////////
const StateContext = createContext();

function StateContextProvider(props) {
  // STATE //////////////////////////////////////////////////////////////////////////////////////////
  const [buildStage, setBuildStage] = useState(0);

  const [keywords, setKeyWords] = useState([]);
  // const [keywordsIndex, setKeyWordsIndex] = useState(0);
  let keywordsIndex = 0;

  const [grid, dispatchGrid] = useReducer(gridReducer, {});

  const [talkyBlocky, dispatchTalkyBlocky] = useReducer(talkyBlockyReducer, {});

  // SPEECH RECOGNITION API //////////////////////////////////////////////////////////////////////
  let recognition;
  const dictionary = [
    "up",
    "down",
    "left",
    "right",
    "write",
    "walkie-talkie",
    "red",
    "blue",
    "blew",
    "green",
    "yellow",
    "violet",
    "purple"
  ];

  function speechHandler(e) {
    if (e.results[0].isFinal) {
      const words = e.results[0][0].transcript.toLowerCase().split(" ");
      const recognizedWords = words.filter(word => dictionary.includes(word));

      keywords.push(...recognizedWords);
      setKeyWords(keywords);

      console.log(keywords);

      // see if there are new keywords to
      if (keywordsIndex !== keywords.length) {
        const newKeywords = keywords.slice(keywordsIndex, keywords.length);
        
        newKeywords.forEach(keyword => {
          
          switch (keyword) {
            case "right" || "write":
              dispatchTalkyBlocky({
                type: "MOVE_TALKY_BLOCKY",
                grid: grid,
                direction: "right"
              });              
            break;
            case "left":              
              dispatchTalkyBlocky({
                type: "MOVE_TALKY_BLOCKY",
                grid: grid,
                direction: "left"
              });
            break;
            case "down":
              dispatchTalkyBlocky({
                type: "MOVE_TALKY_BLOCKY",
                grid: grid,
                direction: "down"
              });
            break;
            case "up":

              dispatchTalkyBlocky({
                type: "MOVE_TALKY_BLOCKY",
                grid: grid,
                direction: "up"
              });
            break;
            
            default:
              console.log("I don't know.")
            break;
          }

          
         setBuildStage(Math.random());
          
        });

        keywordsIndex = keywords.length;
        // setKeyWordsIndex(keywordsIndex);
        console.log(keywordsIndex);
      }
    }
  }

  // Some hacky shit to actually get the API to not stop when the speaker pauses.
  function continuouslyTranscribe() {
    recognition.start();
  }

  // KEY EVENTS //////////////////////////////////////////////////////////////////////////////

  function spaceBarDownHandler(e) {
    if (e.keyCode === 32) {
      recognition.start();
      recognition.addEventListener("end", continuouslyTranscribe);
    }
  }

  function spaceBarUpHandler(e) {
    if (e.keyCode === 32) {
      recognition.removeEventListener("end", continuouslyTranscribe);
      recognition.stop();
      document.addEventListener("keydown", spaceBarDownHandler, { once: true });
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
      document.addEventListener("keydown", spaceBarDownHandler, { once: true });
      document.addEventListener("keyup", spaceBarUpHandler);

      // initializing the speech recognition API
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.addEventListener("result", speechHandler);

      // adding grammar so talky blocky understands certain words more clearly than others
      const grammar = `#JSGF V1.0; grammar talkyblockyDictionary;  public <word> = ${dictionary.join(
        " | "
      )};`;
      const speechRecognitionList = new window.webkitSpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;

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
