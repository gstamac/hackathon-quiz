import React from 'react'
import { useStyles } from './styles'
import { ContactsWrapper } from './contacts_wrapper'
import { PeopleContent } from './people_content'
import { useIsMobileView } from '../global/helpers'

export const People: React.FC = () => {
  const isMobile: boolean = useIsMobileView()

  const classes = useStyles()

  return (
    <div className={classes.peoplePage}>
      <ContactsWrapper/>
      {!isMobile && <PeopleContent/>}
    </div>
  )
}
