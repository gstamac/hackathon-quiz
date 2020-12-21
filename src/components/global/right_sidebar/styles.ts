import { makeStyles, Theme } from '@material-ui/core'
import { RightSidebarIconType } from './interfaces'

interface StyleProps {
  closeButton?: RightSidebarIconType
}

export const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    minWidth: '375px',

    [theme.breakpoints.down('xs')]: {
      minWidth: 'unset',
    },
  },

  sidebarHeader: {
    display: 'inline-flex',
    flexDirection: 'row',
    justifyContent: (props: StyleProps) => props.closeButton === RightSidebarIconType.BACK ? 'flex-start' : 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3, 4, 2),
    fontFamily: 'Averta-Bold',
    fontSize: '33px',
    lineHeight: '26px',
  },

  content: {
    overflowY: 'auto',
    height: 'calc(100% - 74px)',
  },

  backIconStyle: {
    height: '16px',
    width: '16px',
  },

  backIconWrapperStyle: {
    backgroundColor: theme.palette.customColors.whiteSmoke,
    borderRadius: '22px',
    height: '40px',
    minWidth: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    marginRight: theme.spacing(2),
  },

  closeSidebarIconStyle: {
    height: '14.55px',
    width: '14.55px',
  },

  closeSidebarIconWrapperStyle: {
    backgroundColor: theme.palette.customColors.whiteSmoke,
    borderRadius: '22px',
    height: '40px',
    width: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },

  headerTitle: {
    lineHeight: '40px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}))
