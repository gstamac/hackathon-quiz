import styled from 'styled-components'
import { Theme } from '../../enums'

export interface StyledProps {
  theme: Theme
}

export const StyleLayoutControl = styled.div<StyledProps>`
  margin: 0 0.625rem;
  display: grid;
  grid-template-rows: 1.5rem 1rem;
  justify-items: center;
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  grid-template-columns: 1.5rem 1.5rem;

  div {
    text-transform: capitalize;
    color: ${props => props.theme === Theme.LIGHT ? '#50545e' : '#FFF'};
    grid-row-start: 2;
    font-size: 0.65rem;
    padding-top: 0.25rem;
    justify-self: center;
    grid-column: 1;
    width: 40px;
  }

  img {
    filter: ${props => props.theme === Theme.LIGHT ? 'none' : 'brightness(0) invert(1)'};
    cursor: pointer;
    height: 15px;
  }
`
