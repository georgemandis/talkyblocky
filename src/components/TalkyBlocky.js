import styled, {css} from 'styled-components';

const TalkyBlocky = styled.div`
  position: absolute;
  background-color: black;

  ${props =>
    props.talkyBlocky && css`
    left: ${props.talkyBlocky.left}px;  
    top: ${props.talkyBlocky.top}px;
    width: ${props.talkyBlocky.size}px;
    height: ${props.talkyBlocky.size}px;   
    `
  }
`

export default TalkyBlocky;