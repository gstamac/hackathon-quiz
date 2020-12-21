import { Folder } from '@globalid/messaging-service-sdk'
import { IconButton, Tooltip } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { getString } from '../../utils'
import { PageContentHeader } from '../page_content_header'
import { ChannelCreate } from './channel_create'
import { ChannelFolders } from './channel_folders'
import { ChannelsList } from './channels_list/channels_list'
import { ChannelsWrapperProps, EncryptionStatus, MessagesType } from './interfaces'
import { useStyles } from './styles'

export const ChannelsWrapper: React.FC<ChannelsWrapperProps> = ({
  encryptionStatus,
  folderType,
  groupUuid,
}: ChannelsWrapperProps) => {
  const classes = useStyles()

  const [showChannelCreate, setShowChannelCreate] = useState<boolean>(false)

  const folders: Folder[] = useSelector((state: RootState) => state.channels.folders)

  const onChannelCreate = (): void => {
    setShowChannelCreate(true)
  }

  const channelCreateDisabled: boolean =
    encryptionStatus !== EncryptionStatus.ENABLED

  const getList = (): JSX.Element | null => {

    if (folders.length === 0 || encryptionStatus !== EncryptionStatus.ENABLED) {
      return null
    }

    return <ChannelsList folderType={folderType} folders={folders} />
  }

  let createChannelTooltipText: string | undefined

  if (encryptionStatus === EncryptionStatus.DISABLED) {
    createChannelTooltipText = getString('channel-create-enable-encryption')
  } else {
    createChannelTooltipText = folderType === MessagesType.GROUPS && !groupUuid ?
      getString('group-create-select-msg')
      : undefined
  }

  const renderChannelsSidebar = (): JSX.Element => <>
    <div className={classes.headerWrapper}>
      <PageContentHeader title={getString('messages-title')} border={false} />
      <Tooltip
        data-testid={'add-channel-tooltip'}
        classes={{ tooltip: classes.tooltipStyle, popperArrow: classes.tooltipPopperArrow }}
        title={createChannelTooltipText ?? ''}
        arrow
        disableHoverListener={createChannelTooltipText === undefined}
      >
        <div className={classes.actionButtonWrapper}>
          <IconButton
            aria-label='add-channel'
            className={classes.actionButton}
            onClick={onChannelCreate}
            disabled={channelCreateDisabled}
          >
            <AddIcon />
          </IconButton>
        </div>
      </Tooltip>
    </div>
    <ChannelFolders />
    {getList()}
  </>

  const getRenderedComponent = (): JSX.Element => {
    if (showChannelCreate) {
      return <ChannelCreate onCreate={() => setShowChannelCreate(false)} />
    }

    return renderChannelsSidebar()
  }

  return (
    <div data-testid='channels_wrapper' className={classes.channelsWrapper}>
      {getRenderedComponent()}
    </div>
  )
}
