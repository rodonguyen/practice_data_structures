import styled from "styled-components";

// Use console.log() and browser console for debugging
export const Tag = styled.span`
  display: inline-block;
  padding: 0.5em;
  background-color: ${props => props.color || 'red'};
  border-radius: ${props => props.borderRadius || '1em'};
`;

export const Icon = styled.img`
  filter: blur(6px);
  
  ${Tag} &:hover {
    filter: blur(0px);
  }
`;
