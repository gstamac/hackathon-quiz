import React from 'react'
import { useStyles } from './styles'
import { IdentitiesSearch } from '../identities_search'
import { PageContentHeader } from '../page_content_header'
import { getString } from '../../utils'

export const ContactsWrapper: React.FC = () => {
  const classes = useStyles()

  return (
    <div className={classes.contactsWrapper}>
      <PageContentHeader title={getString('contacts-title')} border={false} />
      <IdentitiesSearch enableSearchFieldAutoFocus/>
    </div>
  )
}
