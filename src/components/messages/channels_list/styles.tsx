import { makeStyles, Theme } from '@material-ui/core/styles'

interface StyleProps {
  height?: number
  hasUnreadMessages?: boolean
  unreadMessageLength?: number
}

export const useStyles = makeStyles((theme: Theme) => ({
  contactsList: {
    background: theme.palette.customColors.transparentWhite,
    display: 'flex',
    height: (props: StyleProps) => props.height ?? window.innerHeight,
  },
  listElement: {
    border: 'none',
    outline: 'none',
    position: 'initial',
  },
  channelAvatar: {
    width: '56px',
    height: '56px',
  },
  avatarWrapper: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 6,
  },
  listItemWrapper: {
    display: 'flex',
    width: '100%',
    cursor: 'pointer',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    [theme.breakpoints.between('xs', 'sm')]: {
      width: '100%',
    },
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    paddingTop: theme.spacing(1),
    paddingBottom: '7px',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    borderRadius: 0.5,
    borderBottom: `1px solid ${theme.palette.customColors.brightGray}`,
    '&:hover': {
      borderRadius: 6,
      backgroundColor: theme.palette.customColors.brightGray,

      '& $channelFirstAvatarStyle': {
        borderColor: theme.palette.customColors.brightGray,
      },
    },
    '&:hover $channelFirstAvatarStyle': {
      borderColor: theme.palette.customColors.brightGray,
    },
  },
  selectedListItem: {
    border: `0.75px solid ${theme.palette.customColors.electricBlue}`,
    borderRadius: 6,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.customColors.skyBlue,
    '& $channelFirstAvatarStyle': {
      borderColor: theme.palette.customColors.skyBlue,
    },
  },
  channelFirstAvatarStyle: {
    border: `3px solid ${theme.palette.common.white}`,
  },
  channelInfoWrapper: {
    width: 'calc(100% - 56px)',
    padding: theme.spacing(1,0,1,2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleWrapperWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelTitle: {
    fontFamily: 'Averta-Regular',
    fontSize: '11px',
    lineHeight: '13px',
    color: theme.palette.customColors.midGray,
  },
  messageCreatedAt: {
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    lineHeight: '14px',
    color: (props: StyleProps) => props.hasUnreadMessages ? theme.palette.customColors.almostBlack : theme.palette.customColors.midGray,
  },
  description: {
    fontFamily: 'Averta-Bold',
    fontSize: '16px',
    lineHeight: '19px',
    color: theme.palette.customColors.midGray,
  },
  channelDescription: {
    display: 'inline-block',
    fontFamily: 'Averta-Bold',
    maxWidth: 'calc(100% - 16px)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '16px',
    lineHeight: '19px',
    color: theme.palette.customColors.almostBlack,
    lineBreak: 'anywhere',
  },
  lastMessageWrapper: {
    minHeight: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Averta-Regular',
    fontSize: '14px',
    lineHeight: '20px',
    color: (props: StyleProps) => props.hasUnreadMessages ? theme.palette.customColors.almostBlack : theme.palette.customColors.midGray,
    paddingBottom: '1px',
  },
  lastMessageAuthor: {
    fontFamily: 'Averta-SemiBold',
  },
  lastMessageDate: {
    minWidth: 'max-content',
    paddingLeft: '4px',
  },
  lastMessage: {
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-line-clamp': 1,
    '-webkit-box-orient': 'vertical',
    lineBreak: 'anywhere',
  },
  unreadMessagesCountCircle: {
    paddingTop: '1px',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: theme.palette.customColors.electricBlue,
    borderRadius: '13px',
    height: '20px',
    width: (props: StyleProps) => props.unreadMessageLength === 1 ? '20px' : '28px',
    minHeight: '20px',
    minWidth: (props: StyleProps) => props.unreadMessageLength === 1 ? '20px' : '28px',
  },
  unreadMessagesCountNumber: {
    letterSpacing: '0.08px',
    color: theme.palette.customColors.white,
    fontFamily: 'Averta-Semibold',
    height: '16px',
    width: '16px',
    lineHeight: '16px',
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: '12px',
  }}),
)
