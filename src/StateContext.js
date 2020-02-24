// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////
import React, { createContext, useEffect, useReducer, useState } from "react";

// Import Reducers
import gridReducer from "./reducer functions/gridReducer";
import talkyBlockyReducer from "./reducer functions/talkyBlockyReducer";

// Import helper functions
import { colors } from "./helper functions/colors";

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
  const [talkyIsTalking, setTalkyIsTalking] = useState(false);


  // SPEECH RECOGNITION API //////////////////////////////////////////////////////////////////////
  let recognition;
  let synth, talkyBlockyVoice;

  const directions = {
    up: "up",
    down: "down",
    left: "left",
    right: "right",
    rights: "right",
    write: "right"
  }

  const nonCommands = {                        
    // "walkie-talkie": "That's me!",
    "hi":   ["Hi! How's it going?", "Yo!", "Hey there."],
    "high": ["Hi! How's it going?", "Yo!", "Hey there."],    
    "george": "Hi George. It's so nice to hear your voice. I hope you are doing well... I love you.",
    "yo": "Oh. Hi. Um. Is George still there?", // Dree
    // jokes
    "hear": "I like jokes. My life is a joke.", // want to hear a joke?
    "binary": "Ha ha hahahaha haha hahahaha. Oh my god, that is so funny. hahahaha. I love you George.", // 10 types of people joke
    "puns": "I don't know. Why don't thieves get puns?", // why don't thieves get puns?
    "literally": "Oh. Ha.", // they take them them literally
     "localhost": "Thanks for letting me present at localhost with you. I hope nothing goes wrong. That would be embarassing. For you.",
     "thanks" : ["your welcome, easy fix", "no sweat, easy fix", "piece of cake", "It's not like I have a choice"]
  }

  const dictionary = [];

  dictionary.push(...Object.keys(colors));
  dictionary.push(...Object.keys(directions));
  dictionary.push(...Object.keys(nonCommands));

  function talkyBlockySpeak(speech, probability=1) {
    if (Math.random() < probability) {

      // see if multiple responses are possible
      if (typeof speech === 'object') {
        speech = speech[Math.floor(Math.random() * speech.length)];
      }

      const utterThis = new SpeechSynthesisUtterance(speech);
      utterThis.voice = talkyBlockyVoice;
      utterThis.pitch = 1.5;
      utterThis.rate = 0.75;    
      synth.speak(utterThis);
      setTalkyIsTalking(true);
      utterThis.addEventListener("end", talkyStopsTalking);     
      
      // talkyBlocky.isTalking = true;

      // console.log(talkyBlocky);
      // dispatchTalkyBlocky({
      //   type: "TALK_TALKY_BLOCKY",    
      //   grid: grid,    
      //   speak: true
      // });
    }    
  }


  function speechHandler(e) {
    if (e.results[0].isFinal) {      
      const words = e.results[0][0].transcript.toLowerCase().split(" ");
      console.log(words);
      const recognizedWords = words.filter(word => dictionary.includes(word));

      keywords.push(...recognizedWords);
      setKeyWords(keywords);  

      // see if there are new keywords to
      if (keywordsIndex !== keywords.length) {
        const newKeywords = keywords.slice(keywordsIndex, keywords.length);

        if (newKeywords.length > 8) {
          talkyBlockySpeak("You're lucky I'm a computer, because I would forget all of that otherwise.");
        }

        newKeywords.forEach((keyword, index) => {
          console.log(keyword);
          setTimeout((keyword) => {
            if (directions.hasOwnProperty(keyword)) {
              dispatchTalkyBlocky({
                type: "MOVE_TALKY_BLOCKY",
                grid: grid,
                direction: directions[keyword]
              });
                            
              if (newKeywords.length <= 8) {
                talkyBlockySpeak(["Walk walk walk", ""], .25);
              }

            } else if (colors.hasOwnProperty(keyword)) {
              dispatchGrid({
                type: "CHANGE_GRID_BLOCK_COLOR",
                position: [talkyBlocky.gridPos[0], talkyBlocky.gridPos[1]],
                rgb: colors[keyword]
              });
              
              if (newKeywords.length <= 8) {
                talkyBlockySpeak([`Poof. It's ${keyword}`, `Voila.`, `${keyword} it is.`], 1);
              }

            } else if (nonCommands.hasOwnProperty(keyword)) {
              talkyBlockySpeak(nonCommands[keyword]);
            }
  
            setBuildStage(Date.now());
          }, index*350, keyword);
          
        });

        keywordsIndex = keywords.length;
        // setKeyWordsIndex(keywordsIndex);
      }
    }
  }

  function talkyStopsTalking() {
    console.log("stop talking")
    setTalkyIsTalking(false);
  }

  // Some hacky shit to actually get the API to not stop when the speaker pauses.
  function continuouslyTranscribe() {
    recognition.start();
  }

  // KEY EVENTS //////////////////////////////////////////////////////////////////////////////

  function spaceBarDownHandler(e) {
    if (e.keyCode === 32) {
      try {
        recognition.start();
        recognition.addEventListener("end", continuouslyTranscribe);      
      }catch{
        // recognition already started
      }
      
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
            
      // initializing the speech synthesis API
      synth = window.speechSynthesis; 
            
      synth.onvoiceschanged = () => {
        const voices = synth.getVoices();      
        voices.forEach((voice) => {        
            if (voice.name === 'Google US English') {
              talkyBlockyVoice = voice;
              // talkyBlockySpeak("Hi! I'm Walkie-Talkie");
            }
          })          
      };

      // adding grammar so talky blocky understands certain words more clearly than others
      const grammar = `#JSGF V1.0; grammar talkyblockyDictionary;  public <word> = ${dictionary.join(
        " | "
      )};`;
      const speechRecognitionList = new window.webkitSpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;

      setBuildStage(3);
    } else if (buildStage === 3) {      
      setBuildStage(4);
    }
  }, [buildStage]);


  

  // PROVIDE CONTEXT //////////////////////////////////////////////////////////////////////////////
  return (
    <StateContext.Provider value={{ grid, talkyBlocky, talkyIsTalking}}>
      {props.children}
    </StateContext.Provider>
  );
}

// EXPORTS ///////////////////////////////////////////////////////////////////////////////////////
export default StateContext;
export { StateContextProvider };
