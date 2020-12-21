import { makeStyles, Theme } from '@material-ui/core/styles'

interface StyleProperties {
  height?: number
  checkbox?: boolean
  showSelection?: boolean
  endOfList?: boolean
  handleBottomSelectionOverlap?: boolean
  adornment?: boolean
}

export const useStyles = makeStyles((theme: Theme) => ({
  contactsList: {
    background: theme.palette.customColors.transparentWhite,

    height: ({ height }: StyleProperties) => height ?? window.innerHeight,
  },
  description: {
    fontFamily: 'Averta-Regular',
    fontSize: 11,
    lineHeight: '13px',
    color: theme.palette.customColors.midGray,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: ({ checkbox, adornment }: StyleProperties) => `${260 - (checkbox ? 35 : 0) - (adornment ? 24 : 0)}px`,
  },
  listElement: {
    border: 'none',
    outline: 'none',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),

    '&> div:first-child': {
      marginBottom: (props: StyleProperties) => props.handleBottomSelectionOverlap
        && props.showSelection
        && props.endOfList
        ? '80px'
        : undefined,
    },
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    paddingTop: theme.spacing(1),
    paddingBottom: '7px',
    paddingLeft: 0,
    paddingRight: 0,
    borderRadius: 0.5,
    borderBottom: `1px solid ${theme.palette.customColors.brightGray}`,
  },
  listItemWrapper: {
    width: '100%',
    cursor: 'pointer',
    padding: theme.spacing(0, 0, 0, 1),
    '&:hover': {
      borderRadius: 6,
      backgroundColor: theme.palette.customColors.brightGray,
    },
  },
  mutualContactIcon: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: '35px',
    right: '-3px',
  },
  settingsIcon: {
    cursor: 'pointer',
    display: 'none',
    position: 'absolute',
    right: theme.spacing(1),
  },
  settingsIconVisible: {
    display: 'block',
  },
  settingsWithActionCard: {
    '& .MuiList-root .MuiListItem-root:first-child': {
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(0),
      '&.MuiListItem-divider:after': {
        borderBottom: 'none',
      },
    },
  },
  userAvatarWrapper: {
    position: 'relative',
    '& .MuiAvatar-colorDefault': {
      backgroundColor: 'transparent',
    },
  },
  userInfoWrapper: {
    width: '100%',
    paddingLeft: theme.spacing(1),
    '&:hover': {
      '& img': {
        display: 'block',
      },
    },
  },
  userName: {
    fontFamily: 'Averta-Bold',
    fontSize: 16,
    lineHeight: '19px',
    color: theme.palette.customColors.grey,
  },
  userNameAndSettingsIcon: {
    display: 'flex',
    justifyContent: 'space-between',
    minHeight: 28,
    position: 'relative',
  },
  disabled: {
    opacity: 0.5,
    '&:hover': {
      cursor: 'default',
      backgroundColor: theme.palette.customColors.white,
    },
  },
  flexGrow: {
    flexGrow: 1,
  },
  loaderWrapper: {
    paddingTop: 20,
    display: 'flex',
    justifyContent: 'center',
  },
  adornmentStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(2),
  },
  highlightedText: {
    backgroundColor: theme.palette.customColors.lightSteelBlue,
    borderRadius: 4,
  },
}))
