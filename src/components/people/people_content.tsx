import React from 'react'
import selectContactBackground from '../../assets/icons/select_contacts_background.svg'
import noContactsBackground from '../../assets/icons/no_contacts_background.svg'
import { getString } from '../../utils'
import { useStyles } from './styles'
import { MutualContact } from '@globalid/identity-namespace-service-sdk'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { GlobalidLoader } from '../global/loading/globalid_loader'
import { IdentitiesCollection } from '../../store/interfaces'

export const PeopleContent: React.FC = () => {
  const classes = useStyles()

  const contacts: MutualContact[] | undefined =
    useSelector((root: RootState) => root.contacts.contacts)

  const fetchingContacts: boolean =
    useSelector((root: RootState) => root.contacts.fetchingContacts)

  const identities: IdentitiesCollection =
    useSelector((root: RootState) => root.identities.identities)

  const contactsExist: boolean = contacts !== undefined || (Object.keys(identities).length !== 0)

  const backgroundImage = contactsExist ? selectContactBackground : noContactsBackground
  const headerText = contactsExist ?
    getString('contacts-found-heading') : getString('no-contacts-found-heading')
  const descriptionText = contactsExist ?
    getString('contacts-found-description') : getString('no-contacts-found-description')

  const getContactsContent = (): JSX.Element => {
    if (fetchingContacts) {
      return <GlobalidLoader/>
    }

    return (
      <>
        <img
          className={classes.contactsSize}
          src={backgroundImage}
          alt='Select contact background icon'
        />
        <span className={classes.header}>{headerText}</span>
        <span className={classes.description}>{descriptionText}</span>
      </>
    )
  }

  return (
    <div className={classes.peopleContentWrapper}>
      <div className={classes.peopleContent}>
        {getContactsContent()}
      </div>
    </div>
  )
}
