import styled, { css } from "styled-components";

const GridBlock = styled.div`
  ${props =>
    props.size &&
    css`
      width: ${props.size - Math.floor(props.size / 10)}px;
      height: ${props.size - Math.floor(props.size / 10)}px;
      border: ${Math.floor(props.size / 20)}px solid black;
    `};
  ${props =>
    props.color &&
    css`
      background-color: rgb(${props.color});
    `};
`;

export default GridBlock;
