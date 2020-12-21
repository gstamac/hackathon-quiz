import { makeStyles, Theme } from '@material-ui/core/styles'

export interface Props {
  transition?: boolean
  isLoggedIn?: boolean
  isBrowserNotificationsPromptVisible?: boolean
}

export const useStyles = makeStyles((theme: Theme) => ({
  appBarShift: {
    width: 'calc(100% - 210px)',
    marginLeft: '210px',
    [theme.breakpoints.down('sm')]: {
      width: 0,
      marginLeft: '100%',
    },
    transition: 'all 0.2s cubic-bezier(0, 0, 1, 1)',
  },
  space: {
    flex: 1,
  },

  drawer: {
    fontFamily: 'Averta-Semibold',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '& .MuiDrawer-paperAnchorDockedLeft': {
      [theme.breakpoints.down('sm')]: {
        borderRight: 'none',
      },
    },
  },
  drawerOpen: {
    transition: (props?: Props) => props?.transition ? 'all 0.2s cubic-bezier(0, 0, 1, 1)' : 'none',
  },

  drawerClose: {
    width: 0,
    transition: (props?: Props) => props?.transition ? 'all 0.2s cubic-bezier(0, 0, 1, 1)' : 'none',
    overflowX: 'hidden',
  },

  toolbar: {
    width: (props: Props) => props?.isLoggedIn ? '71px' : '210px',
    display: 'flex',
    zIndex: 10,
    '&::-webkit-scrollbar': {
      width: 0,
    },
    borderRight: `1px solid ${theme.palette.customColors.transparentWhite}`,
    [theme.breakpoints.down('sm')]: {
      background: theme.palette.customColors.white,
      color: theme.palette.customColors.darkGrey,
      borderRight: 'none',
      display: 'none',
    },
    background: theme.palette.customColors.whiteSmoke,
    color: theme.palette.customColors.white,
  },

  mobileOrTabletToolbar: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
      zIndex: 10,
      '&::-webkit-scrollbar': {
        width: 0,
      },
      flexDirection: 'column',
      alignItems: 'center',

      '& > ul': {
        width: '80%',
      },

      '& > div': {
        width: '80%',

        '&:last-of-type ': {
          minWidth: '150px',
        },
      },
    },
  },

  skeletonGlobalidLogo: {
    margin: '12px 0 0px 0 !important',
    height: '40px !important',
    width: '178px',
    alignSelf: 'center',
  },

  globalidLogo: {
    display: 'flex',
    justifyContent: 'center',
    margin: '29px 0 8px',
    height: '40px',
  },

  skletonDisconnectButton: {
    height: '40px',
    width: '160px',
    marginBottom: '94px',
    [theme.breakpoints.down('sm')]: {
      width: '160px',
      marginBottom: '94px',
    },
  },

  subMenuDrawer: {
    fontFamily: 'Averta-Semibold',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '& .MuiDrawer-paperAnchorDockedLeft': {
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
  },

  subMenuWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },

  subMenuTitle: {
    height: '76px',
    fontFamily: 'Averta-Semibold',
    fontSize: '22px',
    letterSpacing: '0.523308px',
    [theme.breakpoints.down('xs')]: {
      paddingTop: theme.spacing(2.5),
    },
    paddingTop: theme.spacing(2.6),
    paddingLeft: theme.spacing(2.5),
    background: theme.palette.customColors.white,
    boxShadow: `0px 0px 10px ${theme.palette.customColors.shadowGrey}`,
    position: 'relative',
    alignItems: 'center',
  },

  title: {
    marginLeft: theme.spacing(2),
  },

  backImage: {
    verticalAlign: 'middle',
  },

  subMenu: {
    flexGrow: 1,
    marginTop: theme.spacing(4),
  },

  sidebarItemWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  disconnectIcon: {
    width: '64px',
    height: '64px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    '&:hover': {
      background: theme.palette.customColors.washedGrey,
      [theme.breakpoints.down('sm')]: {
        background: 'inherit',
      },
      cursor: 'pointer',
    },
    '& > img': {
      marginRight: theme.spacing(1),
    },
  },

  disconnectButton: {
    [theme.breakpoints.down('sm')]: {
      maxWidth: '160px',
      marginBottom: '130px',
      marginTop: '0px',
      background: theme.palette.customColors.skyBlue,
      color: theme.palette.customColors.electricBlue,
    },
    width: '126px',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
    marginTop: '14px',
    margin: 'auto',
    minHeight: '40px',
    display: 'flex',
    borderRadius: '22px',
    background: theme.palette.customColors.transparentLightGray,
    lineHeight: '14px',
    alignItems: 'center',
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    color: theme.palette.customColors.white,
    '&:hover': {
      background: theme.palette.customColors.electricBlue,
      [theme.breakpoints.down('sm')]: {
        background: 'inherit',
      },
      cursor: 'pointer',
    },
    '&:focus': {
      background: theme.palette.customColors.electricBlue,
      cursor: 'pointer',
      outline: 0,
      [theme.breakpoints.down('sm')]: {
        background: 'inherit',
      },
    },
    '& > img': {
      marginRight: theme.spacing(1),
    },
  },
}))
