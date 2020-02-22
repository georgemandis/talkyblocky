import React, {useEffect, useContext} from 'react';

import StateContext from '../StateContext';

// Import Components
import Grid from './Grid';
import TalkyBlocky from './TalkyBlocky';

export default function Display() {
  const {talkyBlocky, grid} = useContext(StateContext);

  return(
    <div>
      <Grid grid={grid} />
      <TalkyBlocky talkyBlocky={talkyBlocky}/>
    </div>
  )
}