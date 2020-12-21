import styled from 'styled-components'
import { StyledProps } from './interfaces'

export const StyledControls = styled.div<StyledProps>`
  opacity: ${props => (props.active ? '1' : '0')};
  transition: opacity 250ms ease;

  @media screen and (max-width: 768px) {
    opacity: 1;
  }

  .controls-menu {
    width: 100%;
    position: static;
  }
`
