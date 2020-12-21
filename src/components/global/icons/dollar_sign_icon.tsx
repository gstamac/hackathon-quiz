import React from 'react'

export const DollarSignIcon = (color: string = '#1C1C1C'): JSX.Element => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M14.5 11H13V6H17C17.6 6 18 5.6 18 5C18 4.4 17.6 4 17 4H13V1C13 0.4 12.6 0 12 0C11.4 0 11 0.4 11 1V4H9.5C7 4 5 6 5 8.5C5 11 7 13 9.5 13H11V18H6C5.4 18 5 18.4 5 19C5 19.6 5.4 20 6 20H11V23C11 23.6 11.4 24 12 24C12.6 24 13 23.6 13 23V20H14.5C17 20 19 18 19 15.5C19 13 17 11 14.5 11ZM9.5 11C8.1 11 7 9.9 7 8.5C7 7.1 8.1 6 9.5 6H11V11H9.5ZM14.5 18H13V13H14.5C15.9 13 17 14.1 17 15.5C17 16.9 15.9 18 14.5 18Z" fill={color}/>
    <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="5" y="0" width="14" height="24">
      <path fillRule="evenodd" clipRule="evenodd" d="M14.5 11H13V6H17C17.6 6 18 5.6 18 5C18 4.4 17.6 4 17 4H13V1C13 0.4 12.6 0 12 0C11.4 0 11 0.4 11 1V4H9.5C7 4 5 6 5 8.5C5 11 7 13 9.5 13H11V18H6C5.4 18 5 18.4 5 19C5 19.6 5.4 20 6 20H11V23C11 23.6 11.4 24 12 24C12.6 24 13 23.6 13 23V20H14.5C17 20 19 18 19 15.5C19 13 17 11 14.5 11ZM9.5 11C8.1 11 7 9.9 7 8.5C7 7.1 8.1 6 9.5 6H11V11H9.5ZM14.5 18H13V13H14.5C15.9 13 17 14.1 17 15.5C17 16.9 15.9 18 14.5 18Z" fill="white"/>
    </mask>
    <g mask="url(#mask0)">
      <rect width="24" height="24" fill={color}/>
    </g>
  </svg>
)
