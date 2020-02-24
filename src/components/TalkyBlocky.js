import styled, {css, keyframes} from 'styled-components';

const talkingAnimation = keyframes`
 0% { filter: brightness(1); }  
 50% { filter: brightness(1.5); }
 100% { filter: brightness(1); }
 `; 

const TalkyBlocky = styled.div`
  position: absolute;
  background-repeat:none;  
  transition: left 350ms, right 350ms;
  
  ${props =>    
    props.talkyBlocky && css`
    left: ${props.talkyBlocky.left}px;  
    top: ${props.talkyBlocky.top}px;
    width: ${props.talkyBlocky.size}px;
    height: ${props.talkyBlocky.size}px;
    animation-name: ${props.talkyIsTalking ? talkingAnimation : ''};
    animation-duration: 300ms;
    animation-iteration-count: infinite;    
    background-image:${props.talkyIsListening ? "url(/assets/images/walkie-talkie/wtMed.png)" : "url(/assets/images/walkie-talkie/wtLight.png)"}
    `

  }
  
`

export default TalkyBlocky;