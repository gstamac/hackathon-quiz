import React from 'react'
import { IconInterface } from './interfaces'

export const ellipsisIcon = ({ color }: IconInterface): JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M2.5 10C2.5 9.08334 3.25 8.33334 4.16667 8.33334C5.08333 8.33334 5.83333 9.08334 5.83333 10C5.83333 10.9167 5.08333 11.6667 4.16667 11.6667C3.25 11.6667 2.5 10.9167 2.5 10ZM11.6667 10C11.6667 10.9167 10.9167 11.6667 10 11.6667C9.08333 11.6667 8.33333 10.9167 8.33333 10C8.33333 9.08334 9.08333 8.33334 10 8.33334C10.9167 8.33334 11.6667 9.08334 11.6667 10ZM15.8333 8.33334C14.9167 8.33334 14.1667 9.08334 14.1667 10C14.1667 10.9167 14.9167 11.6667 15.8333 11.6667C16.75 11.6667 17.5 10.9167 17.5 10C17.5 9.08334 16.75 8.33334 15.8333 8.33334Z" fill={color}/>
  </svg>
)
