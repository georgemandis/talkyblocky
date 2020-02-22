import React from 'react';
import './App.css';

import {StateContextProvider} from '../StateContext'
import Display from '../components/Display';


function App() {

  return (
    <div className="App">
      <StateContextProvider>
        <Display />
      </StateContextProvider>
    </div>
  );
}

export default App;
