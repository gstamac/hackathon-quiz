import React, { useState, useEffect } from 'react'
import { GidUUID, Participant } from '../../store/interfaces'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from 'RootType'
import { CONVERSATION_PARTICIPANTS_LIMIT } from '../../constants'
import { getParticipantsByGidUUIDs } from '../../store/participants_selectors'
import { fetchIdentityByGidUUID } from '../../store/identities_slice'
import { ParticipantsHeader } from '../participants_header'
import { IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { getString } from '../../utils'
import { ButtonState, PrimaryButton } from 'globalid-react-ui'
import { IdentitiesSearch } from '../identities_search'
import { ParticipantsBar } from '../participants_bar'
import { useStyles } from './styles'
import { ChannelCreateProps } from './interfaces'
import { createConversation } from '../../utils/channel_helpers'
import { useHistory } from 'react-router-dom'
import { Folder } from '@globalid/messaging-service-sdk'

export const ChannelCreate: React.FC<ChannelCreateProps> = ({
  onCreate,
}: ChannelCreateProps) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()

  const [selectedIdentities, setSelectedIdentities] = useState<GidUUID[]>([])
  const [buttonState, setButtonState] = useState<ButtonState>(ButtonState.DISABLED)

  const canAddToChat: boolean = selectedIdentities.length < CONVERSATION_PARTICIPANTS_LIMIT

  const participants: (Participant | undefined)[] = useSelector((state: RootState) => (
    getParticipantsByGidUUIDs(state, selectedIdentities)
  ))

  const loggedInIdentityUuid: GidUUID | undefined =
    useSelector((root: RootState) => root.identity.identity?.gid_uuid)

  const folders: Folder[] = useSelector((state: RootState) => state.channels.folders)

  const clearSelection = (): void => {
    onCreate()
    setSelectedIdentities([])
  }

  useEffect(() => {
    if (buttonState !== ButtonState.INPROGRESS) {
      if (selectedIdentities.length > 0) {
        setButtonState(ButtonState.DEFAULT)
      } else {
        setButtonState(ButtonState.DISABLED)
      }
    }
  }, [selectedIdentities.length])

  const handleCreateConversation = async (): Promise<void> => {
    setButtonState(ButtonState.INPROGRESS)
    try {
      if (loggedInIdentityUuid !== undefined){
        await createConversation(
          selectedIdentities,
          loggedInIdentityUuid,
          folders,
          dispatch,
          history,
          { actionBeforeRedirect: clearSelection }
        )
      }
    }
    finally {
      setButtonState(ButtonState.DEFAULT)
    }
  }

  const removeIdentityFromSelection = (gidUuid: GidUUID): void => {
    const result: GidUUID[] = selectedIdentities.filter((uuid: GidUUID) => uuid !== gidUuid)

    setSelectedIdentities(result)
  }

  const addIdentityToSelection = (gidUuid: GidUUID): void => {
    dispatch(fetchIdentityByGidUUID(gidUuid))
    setSelectedIdentities([gidUuid, ...selectedIdentities])
  }

  const handleOnSelect = (gidUuid: GidUUID, selected: boolean): void => {
    if (selected && canAddToChat) {
      addIdentityToSelection(gidUuid)
    } else {
      removeIdentityFromSelection(gidUuid)
    }
  }

  const renderHeader = (): JSX.Element => (
    <>
      <ParticipantsHeader participantsCount={selectedIdentities.length}/>
      <IconButton aria-label='clear-participants' className={classes.removeButton} onClick={clearSelection}>
        <CloseIcon/>
      </IconButton>
    </>
  )

  const renderContent = (): JSX.Element => (
    <>
      <IdentitiesSearch onSelect={handleOnSelect} selectedIdentities={selectedIdentities} showSelection={true} excludeMe enableSearchFieldAutoFocus>
        <ParticipantsBar participants={participants} removeFromParticipants={removeIdentityFromSelection}/>
      </IdentitiesSearch>
      <PrimaryButton buttonState={buttonState} className={classes.doneButton} onClick={handleCreateConversation}>
        <span>{getString('done')}</span>
      </PrimaryButton>
    </>
  )

  return (<>
    {renderHeader()}
    {renderContent()}
  </>)

}
