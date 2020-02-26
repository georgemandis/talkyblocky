import styled, { css, keyframes } from "styled-components";

const talkingAnimation = keyframes`
 0% { filter: brightness(1); }  
 50% { filter: brightness(1.5); }
 100% { filter: brightness(1); }
 `;

const TalkyBlocky = styled.div`
  position: absolute;
  background-repeat: none;
  transition: left 350ms, top 350ms;

  ${props =>
    props.talkyBlocky &&
    css`
      left: ${props.talkyBlocky.left}px;
      top: ${props.talkyBlocky.top}px;
      width: ${props.talkyBlocky.size}px;
      height: ${props.talkyBlocky.size}px;
      animation-name: ${props.talkyIsTalking ? talkingAnimation : ""};
      animation-duration: 300ms;
      animation-iteration-count: infinite;
      background-image: ${props.talkyBackground
        ? `url(/assets/images/walkie-talkie/${props.talkyBackground})`
        : "url(/assets/images/walkie-talkie/wtDefault.png)"};
    `}
`;

export default TalkyBlocky;
