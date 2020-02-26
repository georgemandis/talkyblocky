// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////
import React, { createContext, useEffect, useReducer, useState } from "react";

// Import Reducers
import gridReducer from "./reducers/gridReducer";
import talkyBlockyReducer from "./reducers/talkyBlockyReducer";

// Import helper functions
import { directions, colors, nonCommands } from "./helpers/dictionary";

// CREATE CONTEXT ////////////////////////////////////////////////////////////////////////////////////
const StateContext = createContext();

function StateContextProvider(props) {
  // STATE //////////////////////////////////////////////////////////////////////////////////////////
  const [buildStage, setBuildStage] = useState(0);
  const [keywords, setKeyWords] = useState([]);
  const [talkyIsTalking, setTalkyIsTalking] = useState(false);
  const [talkyBackground, setTalkyBackground] = useState(false);

  const [grid, dispatchGrid] = useReducer(gridReducer, {});
  const [talkyBlocky, dispatchTalkyBlocky] = useReducer(talkyBlockyReducer, {});

  // SPEECH RECOGNITION //////////////////////////////////////////////////////////////////////
  const dictionary = [];
  let keywordsIndex = 0;
  let recognition, synth, talkyBlockyVoice;

  dictionary.push(...Object.keys(colors));
  dictionary.push(...Object.keys(directions));
  dictionary.push(...Object.keys(nonCommands));

  // SPEECH RECOGNITION //////////////////////////////////////////////////////////////////////
  function speechHandler(e) {
    if (e.results[0].isFinal) {
      const words = e.results[0][0].transcript.toLowerCase().split(" ");
      console.log(words);
      const recognizedWords = words.filter(word => dictionary.includes(word));

      keywords.push(...recognizedWords);
      setKeyWords(keywords);
      processNewKeywords();
    }
  }

  function processNewKeywords() {
    // see if there are new keywords to
    if (keywordsIndex !== keywords.length) {
      const newKeywords = keywords.slice(keywordsIndex, keywords.length);

      if (newKeywords.length > 8) {
        talkyBlockySpeak(
          "You're lucky I'm a computer, because I would forget all of that otherwise."
        );
      }

      newKeywords.forEach((keyword, index) => {
        console.log(keyword);

        setTimeout(
          keyword => {
            if (directions.hasOwnProperty(keyword)) {
              dispatchTalkyBlocky({
                type: "MOVE_TALKY_BLOCKY",
                grid: grid,
                direction: directions[keyword]
              });

              setTalkyBackground(`wt${keyword}.png`);

              if (newKeywords.length <= 8) {
                talkyBlockySpeak(["Walk walk walk", ""], 0.25);
              }
            } else if (colors.hasOwnProperty(keyword)) {
              dispatchGrid({
                type: "CHANGE_GRID_BLOCK_COLOR",
                position: [talkyBlocky.gridPos[0], talkyBlocky.gridPos[1]],
                rgb: colors[keyword]
              });

              if (newKeywords.length <= 8) {
                talkyBlockySpeak(
                  [`Poof. It's ${keyword}`, `Voila.`, `${keyword} it is.`],
                  0.25
                );
              }
            } else if (nonCommands.hasOwnProperty(keyword)) {
              talkyBlockySpeak(nonCommands[keyword]);
            }

            setBuildStage(Date.now());
          },
          index * 350,
          keyword
        );

        setTimeout(() => {
          setTalkyBackground(`wtDefault.png`);
        }, (newKeywords.length + 1) * 350);
      });

      keywordsIndex = keywords.length;
    }
  }

  function talkyStartsListening() {
    setTalkyBackground("wtListening.png");
  }

  function talkyStopsListening() {
    setTalkyBackground(false);
  }

  // Some hacky shit to actually get the API to not stop when the speaker pauses.
  function continuouslyTranscribe() {
    recognition.start();
  }

  // SPEECH SYNTHESIS //////////////////////////////////////////////////////////////////////
  function talkyBlockySpeak(speech, probability = 1) {
    if (Math.random() < probability) {
      // see if multiple responses are possible
      if (typeof speech === "object") {
        speech = speech[Math.floor(Math.random() * speech.length)];
      }

      const utterThis = new SpeechSynthesisUtterance(speech);
      utterThis.voice = talkyBlockyVoice;
      utterThis.pitch = 1.5;
      utterThis.rate = 0.75;
      synth.speak(utterThis);
      setTalkyIsTalking(true);
      utterThis.addEventListener("end", talkyStopsTalking);
    }
  }

  function startTutorial(e) {
    if (e.keyCode === 116) {
      // 'T'
      // talkyBlockyVoice.rate = 2
      talkyBlockySpeak(
        "Hi. I'm Talky Blocky! Hold down the spacebar to talk to me."
      );
      talkyBlockySpeak(
        "If you say right, left, down or up I can move around the grid."
      );
      talkyBlockySpeak(
        "Say the name of any color and I can change the grid blocks to that color!"
      );
      talkyBlockySpeak("You can also say hello and thanks.");
      talkyBlockySpeak("Please speak clearly so that I can understand you.");
      talkyBlockySpeak("Press 'T' to hear the tutorial again.");
    }
  }

  function talkyStopsTalking() {
    setTalkyIsTalking(false);
  }

  // KEY EVENTS //////////////////////////////////////////////////////////////////////////////
  function spaceBarDownHandler(e) {
    if (e.keyCode === 32) {
      try {
        const sound = new Audio();
        sound.src = "/assets/sounds/listenSound.wav";
        sound.volume = 0.015;
        sound.play();

        recognition.start();
        recognition.addEventListener("end", continuouslyTranscribe);
      } catch {
        // recognition already started
      }
    }
  }

  function spaceBarUpHandler(e) {
    if (e.keyCode === 32) {
      const sound = new Audio();
      sound.src = "/assets/sounds/executeSound.wav";
      sound.volume = 0.015;
      sound.play();

      recognition.removeEventListener("end", continuouslyTranscribe);
      recognition.stop();
      document.addEventListener("keydown", spaceBarDownHandler, { once: true });
    }
  }

  // Initialize //////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (buildStage === 0) {
      dispatchGrid({ type: "BUILD_GRID" });
      setBuildStage(1);
    } else if (buildStage === 1) {
      dispatchTalkyBlocky({ type: "BUILD_TALKY_BLOCKY", grid: grid });
      setBuildStage(2);
    } else if (buildStage === 2) {
      document.addEventListener("keydown", spaceBarDownHandler, { once: true });
      document.addEventListener("keyup", spaceBarUpHandler);
      document.addEventListener("keypress", startTutorial);

      // initializing the speech recognition API
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.addEventListener("result", speechHandler);
      recognition.addEventListener("audiostart", talkyStartsListening);
      recognition.addEventListener("audioend", talkyStopsListening);

      // initializing the speech synthesis API
      synth = window.speechSynthesis;

      synth.addEventListener("voiceschanged", () => {
        const voices = synth.getVoices();
        voices.forEach(voice => {
          if (voice.name === "Google US English" && !talkyBlockyVoice) {
            talkyBlockyVoice = voice;
          }
        });
      });

      // adding grammar so talky blocky understands certain words more clearly than others
      const grammar = `#JSGF V1.0; grammar talkyblockyDictionary;  public <word> = ${dictionary.join(
        " | "
      )};`;

      const speechRecognitionList = new window.webkitSpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;

      setBuildStage(3);
    } else if (buildStage === 3) {
      alert(
        "Hi. I'm Talky Blocky! Hold down the spacebar to talk to me. If you say right, left, down or up I can move around the grid. Say the name of any color and I can change the grid blocks to that color! You can also say hello and thanks. Please speak clearly so that I can understand you. Press 'T' to hear me speak this to you."
      );
      setBuildStage(4);
    }
  }, [buildStage]);

  // PROVIDE CONTEXT //////////////////////////////////////////////////////////////////////////////
  return (
    <StateContext.Provider
      value={{ grid, talkyBlocky, talkyIsTalking, talkyBackground }}
    >
      {props.children}
    </StateContext.Provider>
  );
}

// EXPORTS ///////////////////////////////////////////////////////////////////////////////////////
export default StateContext;
export { StateContextProvider };
