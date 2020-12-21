import React from 'react'
import { IconInterface } from './interfaces'

export const rightArrowIcon = ({ color }: IconInterface): JSX.Element => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.775 9.525L7.275 14.025C7.125 14.175 6.975 14.25 6.75 14.25C6.525 14.25 6.375 14.175 6.225 14.025C5.925 13.725 5.925 13.275 6.225 12.975L10.2 9L6.225 5.025C5.925 4.725 5.925 4.275 6.225 3.975C6.525 3.675 6.975 3.675 7.275 3.975L11.775 8.475C12.075 8.775 12.075 9.225 11.775 9.525Z" fill={color}/>
  </svg>
)
