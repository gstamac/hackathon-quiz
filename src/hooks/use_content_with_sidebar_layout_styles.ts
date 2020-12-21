import { makeStyles, Theme } from '@material-ui/core'

interface StyleProps {
  showOverlay?: boolean
  centerAlign?: boolean
  header?: boolean
}

export const useContentWithSidebarLayoutStyles = makeStyles((theme: Theme) => ({
  sidebarWrapper: {
    height: '100vh',
    maxWidth: '375px',
    borderRadius: 0.5,
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
    },
    borderRight: `1px solid ${theme.palette.customColors.backgroundGrey}`,
    position: 'relative',
    flexGrow: 1,
    flexBasis: '40%',
    flexDirection: 'column',

    [theme.breakpoints.down('xs')]: {
      display: (props: StyleProps) => props.showOverlay ? 'none' : 'inherit',
      maxWidth: '100%',
    },

    [theme.breakpoints.down('sm')]: {
      height: 'calc(100vh - 62px)',
    },
  },

  contentWrapper:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: (props: StyleProps) => props.centerAlign ? 'center' : 'flex-start',
    alignItems: 'center',
    paddingTop: (props: StyleProps) => props.header ? theme.spacing(6.5) : undefined,
    position: 'relative',
    width: '100%',

    [theme.breakpoints.down('sm')]: {
      display: 'flex',
    },
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
}))
