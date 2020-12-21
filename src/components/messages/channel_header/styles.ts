import { makeStyles, Theme } from '@material-ui/core'

interface StyleProps {
  height?: number
}

export const useStyles = makeStyles((theme: Theme) => ({
  channelHeader: {
    borderBottom: `1px solid ${theme.palette.customColors.transparentWhite}`,
    position: 'relative',
    zIndex: 4,
  },

  headerWrapper: {
    minHeight: '76px',
    fontSize: '22px',
    padding: theme.spacing(2),
    background: theme.palette.customColors.white,
    boxShadow: `0px 0px 10px ${theme.palette.customColors.shadowGrey}`,
    textAlign: 'center',
  },

  infoField: {
    display: 'flex',
    flexDirection: 'column',
  },

  settingsIcon: {
    cursor: 'pointer',
    position: 'absolute',
    right: '30px',
    top: '17px',
    color: 'black',
    display: 'flex',
    flexDirection: 'row',
  },

  channelLogo: {
    width: '16px',
    height: '16px',
    marginRight: theme.spacing(1),
    borderRadius: '4px',
  },

  aliasText: {
    padding: theme.spacing(0, 8),
    wordBreak: 'break-word',
    color: theme.palette.customColors.grey,
    fontFamily: 'Averta-Bold',
    fontSize: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    '& div': {
      width: '16px',
      height: '16px',
      marginRight: theme.spacing(1),
      borderRadius: '4px',
    },

    '& span': {
      width: '16px',
      height: '16px',
      marginRight: theme.spacing(1),
      borderRadius: '4px',
    },
  },

  title: {
    marginRight: theme.spacing(4),
  },

  participantsText: {
    paddingRight: theme.spacing(0, 8),
    color: theme.palette.customColors.midGray,
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
  },

  participantsTextMargin: {
    marginTop: '5px',
    marginRight: theme.spacing(1),
  },

  channelSettingsPopover: {
    '& .MuiPopover-paper': {
      width: '318px',
      padding: '32px 14px 32px 24px',
      boxSizing: 'border-box',
    },
  },

  channelSettingsWithActionCard: {
    '& .MuiPopover-paper': {
      width: '318px',
      padding: theme.spacing(3),
      boxSizing: 'border-box',
    },
    '& .MuiList-root .MuiListItem-root:first-child': {
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(0),
      cursor: 'default',
      '&.MuiListItem-divider:after': {
        borderBottom: 'none',
      },
      '& .MuiTouchRipple-root': {
        display: 'none',
      },
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },

  channelDetailsLogoSingle: {
    width: '90px',
    height: '90px',
  },

  channelDetailsLogoMulti: {
    width: '54px',
    height: '54px',
  },

  channelDetailsLogoWrapper: {
    width: '79px',
    height: '79px',
    position: 'relative',
  },

  badgePositionClassName: {
    right: '30%',
    bottom: '30%',
  },

  memberList: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '328px',
    height: (props: StyleProps) => props.height,
  },

  memberListItem: {
    width: '328px',
    outline: 'none',
  },

  loaderWrapper: {
    margin: '0 auto',
  },

  iconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: theme.palette.customColors.brightGray,
    },
  },
}))
