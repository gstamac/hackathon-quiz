import { makeStyles, Theme } from '@material-ui/core'

interface UnsupportedMessageStylesProps {
  me: boolean
}

interface ChatMessageCardsStylesProps {
  me: boolean
  deleted: boolean
  errorAdornment: boolean
  resending?: boolean
  isVisible?: boolean
  receiving?: boolean
  renderAvatar?: boolean
  numberOfImages?: number
}

export const useStyles = makeStyles((theme: Theme) => ({
  textMessageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: (props: ChatMessageCardsStylesProps) =>
      props.me ? 'flex-end' : 'flex-start',
    justifyContent: (props: ChatMessageCardsStylesProps) =>
      props.me
        ? 'flex-end'
        : 'flex-start',
  },
  textMessageContentWithAdornmentContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: ({ me, renderAvatar }: ChatMessageCardsStylesProps) =>
      !renderAvatar && !me ? theme.spacing(5) : undefined,
    alignItems: (props: ChatMessageCardsStylesProps) => props.me ? 'flex-end' : 'flex-start',
    justifyContent: (props: ChatMessageCardsStylesProps) => props.me
      ? 'flex-end'
      : 'flex-start',
    maxWidth: 'calc(50%)',
    cursor: 'pointer',
  },

  textMessageContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    cursor: 'pointer',
  },

  textMessageContentRow: {
    display: 'flex',
    flexDirection: (props: ChatMessageCardsStylesProps) => props.me
      ? 'row-reverse'
      : 'row',
  },
  transparent: {
    opacity: 0.5,
  },
  textMessageContent: {
    padding: theme.spacing(1.625, 2),
    fontSize: '15px',
    lineHeight: '18px',
    borderRadius: '16px',
    position: 'relative',
    border: (props: ChatMessageCardsStylesProps) => props.me
      ? undefined
      : `solid 1px ${theme.palette.customColors.washedGrey}`,
    backgroundColor: (props: ChatMessageCardsStylesProps) => props.me
      ? theme.palette.customColors.backgroundBlue
      : theme.palette.common.white,
    color: (props: ChatMessageCardsStylesProps) => props.me
      ? props.resending ? theme.palette.customColors.backgroundBlue : theme.palette.common.white
      : theme.palette.customColors.grey,
    opacity: (props: ChatMessageCardsStylesProps) => props.deleted ? 0.5 : 1,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',

    cursor: (props: ChatMessageCardsStylesProps) => props.errorAdornment && props.me && !props.resending
      ? 'pointer'
      : 'default',

    '& a': {
      color: (props: ChatMessageCardsStylesProps) => props.me
        ? theme.palette.customColors.turquoiseBlue
        : theme.palette.customColors.electricBlue,
      fontFamily: 'Averta-Semibold',
      textDecoration: 'underline',
    },
  },

  imageTopRightBorder: {
    borderTopRightRadius: '16px',
  },

  imageTopLeftBorder: {
    borderTopLeftRadius: '16px',
  },

  imageBottomRightBorder: {
    borderBottomRightRadius: '16px',
  },

  imageBottomLeftBorder: {
    borderBottomLeftRadius: '16px',
  },

  imageBackground: {
    border: (props: ChatMessageCardsStylesProps) => props.me
      ? undefined
      : `solid 1px ${theme.palette.customColors.washedGrey}`,
    backgroundColor: (props: ChatMessageCardsStylesProps) => props.me
      ? theme.palette.customColors.transparentWhite
      : theme.palette.common.white,
    overflowWrap: 'anywhere',
    cursor: (props: ChatMessageCardsStylesProps) => props.errorAdornment && props.me && !props.resending
      ? 'pointer'
      : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: (props: ChatMessageCardsStylesProps) => (props.resending)
      ? 0.5
      : 1,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  placeholderBackground: {
    backgroundColor: (props: ChatMessageCardsStylesProps) => props.me
      ? theme.palette.customColors.backgroundBlue
      : theme.palette.common.white,
    overflowWrap: 'anywhere',
    cursor: (props: ChatMessageCardsStylesProps) => props.errorAdornment && props.me && !props.resending
      ? 'pointer'
      : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    borderRadius: '16px',
  },
  infoIconForeground: {
    opacity: 1,
    overflowWrap: 'anywhere',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },

  adornmentStyle: {
    paddingTop: theme.spacing(0.9),
    paddingRight: theme.spacing(2),
    fontSize: '11px',
    lineHeight: '13px',
    color: (props: ChatMessageCardsStylesProps) => props.errorAdornment && !props.resending
      ? theme.palette.customColors.red
      : theme.palette.customColors.grey,
    '&:hover': {
      cursor: (props: ChatMessageCardsStylesProps) => props.errorAdornment && !props.resending
        ? 'pointer'
        : 'auto',
    },
  },

  settingsIcon: {
    position: 'absolute',
    left: '-45px',
    borderRadius: '20px',
    padding: theme.spacing(1),
    height: '40px',
    width: '40px',
    alignSelf: 'center',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.customColors.skyBlue,
    },
  },

  settingsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
  },

  progressWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    zIndex: (props: ChatMessageCardsStylesProps) => props.resending ? 1 : -1,
  },

  circularProgress: {
    color: theme.palette.customColors.lightGrey,
    margin: 'auto',
  },

  imageMessageContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    cursor: 'pointer',
  },

  imageMessageContentWithAdornmentContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: ({ me, renderAvatar }: ChatMessageCardsStylesProps) =>
      !renderAvatar && !me ? theme.spacing(5) : undefined,
    alignItems: (props: ChatMessageCardsStylesProps) => props.me ? 'flex-end' : 'flex-start',
    justifyContent: (props: ChatMessageCardsStylesProps) => props.me
      ? 'flex-end'
      : 'flex-start',
    maxWidth: 'calc(50%)',
    cursor: 'pointer',
  },

  imageGridContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  imageContainer: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  imageHidden: {
    display: 'none',
  },

  imageMessageContent: {
    borderRadius: '16px',
    whiteSpace: 'pre-wrap',
    position: 'relative',
    border: (props: ChatMessageCardsStylesProps) => props.me
      ? undefined
      : `solid 1px ${theme.palette.customColors.washedGrey}`,
    backgroundColor: (props: ChatMessageCardsStylesProps) => props.me && !props.errorAdornment
      ? theme.palette.customColors.backgroundBlue
      : theme.palette.common.white,
    opacity: 1,
    overflowWrap: 'anywhere',

    cursor: (props: ChatMessageCardsStylesProps) => props.errorAdornment && !props.resending
      ? 'pointer'
      : 'default',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: '240px',
  },

  imageLoadingContent: {
    opacity: 0.5,
    backgroundColor: theme.palette.customColors.brightGray,
    overflowWrap: 'anywhere',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    borderRadius: '16px',
  },

  relative: {
    position: 'relative',
  },

  adornmentImageStyle: {
    paddingTop: theme.spacing(0.9),
    paddingRight: theme.spacing(2),
    fontSize: '11px',
    lineHeight: '13px',
    color: theme.palette.customColors.red,
    '&:hover': {
      cursor: 'pointer',
    },
  },

  mediaContainer: {
    display: 'grid',
    gridTemplateColumns: ({
      numberOfImages,
    }: ChatMessageCardsStylesProps) => numberOfImages === undefined || numberOfImages === 1
      ? 257
      : numberOfImages === 2
        ? '128px 128px'
        : '84px 84px 84px',
    gridAutoRows: ({
      numberOfImages,
    }: ChatMessageCardsStylesProps) => numberOfImages === undefined || numberOfImages === 1
      ? '200px'
      : numberOfImages === 2
        ? '128px'
        : '84px',
    borderRadius: '20px',
    columnGap: '2px',
    rowGap: '2px',
    backgroundColor: ({ me }: ChatMessageCardsStylesProps) =>
      me ? theme.palette.customColors.backgroundBlue : theme.palette.common.white,
  },

  mediaMessageTextContainer: {
    width: '257px',
    padding: theme.spacing(1.625, 2),
    fontSize: '15px',
    lineHeight: '18px',
    whiteSpace: 'pre-wrap',
    position: 'relative',
    color: ({ me, resending }: ChatMessageCardsStylesProps) => me
      ? resending ? theme.palette.customColors.backgroundBlue : theme.palette.common.white
      : theme.palette.customColors.grey,
    overflowWrap: 'anywhere',
    cursor: ({ me, errorAdornment, resending }: ChatMessageCardsStylesProps) => errorAdornment && me && !resending
      ? 'pointer'
      : 'default',

    '& a': {
      color: ({ me }: ChatMessageCardsStylesProps) => me
        ? theme.palette.customColors.turquoiseBlue
        : theme.palette.customColors.electricBlue,
      fontFamily: 'Averta-Semibold',
      textDecoration: 'underline',
    },
  },

  mediaMessageContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    backgroundColor: ({ me }: ChatMessageCardsStylesProps) =>
      me ? theme.palette.customColors.backgroundBlue : theme.palette.common.white,
    border: ({ me }: ChatMessageCardsStylesProps) => me
      ? undefined
      : `solid 1px ${theme.palette.customColors.washedGrey}`,
    opacity: (props: ChatMessageCardsStylesProps) => props.deleted ? 0.5 : 1,
  },
}))

export const useSystemMessageStyles = makeStyles((theme: Theme) => ({
  systemMessageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '48px',
    overflowWrap: 'break-word',
  },
  systemMessageContent: {
    maxWidth: '235px',
    color: theme.palette.customColors.lightGrey,
    opacity: 0.5,
    mixBlendMode: 'normal',
    textAlign: 'center',
    fontSize: '11px',
  },
}))

export interface MessageGroupingStylesProps {
  isSideSeparated: boolean
  iAmAuthor: boolean
  prevIsSystemMessage: boolean
}

export const useMessageGroupingStyles = makeStyles((theme: Theme) => ({

  userImage: {
    height: '32px',
    width: '32px',
    marginRight: theme.spacing(1),
    borderRadius: '50%',
    display: 'flex',
    alignSelf: 'flex-end',
  },

  userName: {
    paddingLeft: ({ iAmAuthor }: MessageGroupingStylesProps) => !iAmAuthor ? theme.spacing(7) : undefined,
    paddingBottom: theme.spacing(0.5),
    color: theme.palette.customColors.lightGrey,
  },

  timestamp: {
    textAlign: 'center',
    paddingBottom: (props: MessageGroupingStylesProps) => props.iAmAuthor
      ? theme.spacing(3)
      : theme.spacing(2),
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    lineHeight: '14px',
    color: theme.palette.customColors.midGray,
  },

  groupFirstMessage: {
    paddingTop: (props: MessageGroupingStylesProps) => props.isSideSeparated || props.prevIsSystemMessage
      ? theme.spacing(3)
      : theme.spacing(2),
    paddingBottom: theme.spacing(0),
  },

  groupMiddleMessage: {
    paddingTop: (props: MessageGroupingStylesProps) => props.prevIsSystemMessage
      ? theme.spacing(3)
      : theme.spacing(1),
    paddingBottom: theme.spacing(0),
  },

  groupLastMessage: {
    paddingTop: (props: MessageGroupingStylesProps) => props.prevIsSystemMessage
      ? theme.spacing(3)
      : theme.spacing(1),
    paddingBottom: theme.spacing(0),
  },

  defaultMessageSpacing: {
    paddingTop: (props: MessageGroupingStylesProps) => props.prevIsSystemMessage
      ? theme.spacing(3)
      : theme.spacing(2),
    paddingBottom: theme.spacing(0),
  },

  typingCard: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(1),
  },

  typing: {
    height: '44px',
    width: '55px',
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    paddingTop: theme.spacing(0.75),
    border: `1px solid ${theme.palette.customColors.washedGrey}`,
    borderRadius: '16px',
  },
}))

export type MessageGroupingClasses = ReturnType<typeof useMessageGroupingStyles>

export const useInfoMessageStyles = makeStyles((theme: Theme) => ({
  infoMessageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoMessageContent: {
    maxWidth: '235px',
    color: theme.palette.customColors.lightGrey,
    mixBlendMode: 'normal',
    textAlign: 'center',
    fontSize: '11px',
    lineHeight: '13px',
    padding: theme.spacing(1.25),
  },
  infoMessageIcon: {
    marginTop: theme.spacing(0.25),
    marginBottom: theme.spacing(1.25),
  },
  infoMessageText: {
    margin: theme.spacing(0),
  },
  infoMessageLink: {
    color: theme.palette.customColors.electricBlue,
    textDecoration: 'none',
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1.25),
    display: 'inline-block',
  },
}))

export const unsupportedMessageStyles = makeStyles((theme: Theme) => ({
  textMessageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: (props: ChatMessageCardsStylesProps) => props.me ? 'flex-end' : 'flex-start',
    justifyContent: (props: ChatMessageCardsStylesProps) => props.me
      ? 'flex-end'
      : 'flex-start',
  },
  textMessageContentWithAdornmentContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: ({ me, renderAvatar }: ChatMessageCardsStylesProps) =>
      !renderAvatar && !me ? theme.spacing(5) : undefined,
    alignItems: (props: ChatMessageCardsStylesProps) => props.me ? 'flex-end' : 'flex-start',
    justifyContent: (props: ChatMessageCardsStylesProps) => props.me
      ? 'flex-end'
      : 'flex-start',
    maxWidth: 'calc(50%)',
    cursor: 'pointer',
  },

  textMessageContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    cursor: 'pointer',
  },

  messageContent: {
    padding: theme.spacing(1.625, 2),
    borderRadius: '16px',
    whiteSpace: 'pre-wrap',
    position: 'relative',
    border: (props: UnsupportedMessageStylesProps) => props.me
      ? undefined
      : `solid 1px ${theme.palette.customColors.washedGrey}`,
    backgroundColor: (props: UnsupportedMessageStylesProps) => props.me
      ? theme.palette.customColors.backgroundBlue
      : theme.palette.common.white,
  },
  messageHeader: {
    fontFamily: 'Averta-Semibold',
    fontSize: '20px',
    lineHeight: '23px',
    display: 'flex',
    flexDirection: 'row',
    color: (props: UnsupportedMessageStylesProps) => props.me
      ? theme.palette.common.white
      : theme.palette.customColors.almostBlack,
    marginBottom: theme.spacing(1),
  },
  messageHeaderText: {
    width: '155px',
  },
  messageTip: {
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    lineHeight: '14px',
    color: (props: UnsupportedMessageStylesProps) => props.me
      ? theme.palette.common.white
      : theme.palette.customColors.grey,
    opacity: 0.75,
    width: '155px',
  },
  adornmentStyle: {
    paddingTop: theme.spacing(0.9),
    paddingRight: theme.spacing(2),
    fontSize: '11px',
    lineHeight: '13px',
    color: (props: ChatMessageCardsStylesProps) => props.errorAdornment && !props.resending
      ? theme.palette.customColors.red
      : theme.palette.customColors.grey,
    '&:hover': {
      cursor: (props: ChatMessageCardsStylesProps) => props.errorAdornment && !props.resending
        ? 'pointer'
        : 'auto',
    },
  },
}))

export const useDividerStyles = makeStyles((theme: Theme) => ({
  divider: {
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
    borderBottom: '1px solid rgba(0, 0, 0, 0.20)',
    width: '80%',
    margin: '0 auto',
  },
}))
