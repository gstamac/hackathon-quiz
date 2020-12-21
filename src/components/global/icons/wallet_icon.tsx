import React from 'react'
import { IconInterface } from './interfaces'

export const walletIcon = ({ color }: IconInterface): JSX.Element => <svg
  width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18.1481 4.72255H3.43512C3.11523 4.72255 2.87035 4.48625 2.87035 4.21329C2.87035 3.94033 3.11523 3.70403 3.43512 3.70403H15.7869C16.3494 3.70403 16.8054 3.24802 16.8054 2.68551C16.8054 2.123 16.3494 1.66699 15.7869 1.66699H3.43512C2.00616 1.66699 0.833313 2.79871 0.833313 4.21329C0.833313 5.62786 2.00616 6.75958 3.43512 6.75958H18.1481C18.7106 6.75958 19.1666 6.30358 19.1666 5.74107C19.1666 5.17855 18.7106 4.72255 18.1481 4.72255Z"
    fill={color}/>
  <path d="M17.1296 15.9263H3.88887C3.32636 15.9263 2.87035 15.4702 2.87035 14.9077V4.21329C2.87035 3.65078 2.41434 3.19477 1.85183 3.19477C1.28932 3.19477 0.833313 3.65078 0.833313 4.21329L0.833313 14.9077C0.833313 16.5953 2.20133 17.9633 3.88887 17.9633H18.1481C18.7106 17.9633 19.1666 17.5073 19.1666 16.9448V5.74107C19.1666 5.17855 18.7106 4.72255 18.1481 4.72255C17.5856 4.72255 17.1296 5.17855 17.1296 5.74107V15.9263Z"
    fill={color}/>
</svg>
