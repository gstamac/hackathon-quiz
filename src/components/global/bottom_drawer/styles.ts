import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  bottomDrawerRoot: {
    '& .MuiDrawer-paper': {
      padding: theme.spacing(3),
    },
    '& .MuiDrawer-paperAnchorBottom': {
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
    },
  },
  bottomDrawerHeader: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(3),
    minHeight: '24px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomDrawerCloseButton: {
    placeSelf: 'center end',
    cursor: 'pointer',
  },
  bottomDrawerTitle: {
    color: theme.palette.customColors.lightGrey,
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    lineHeight: '14px',
    textIndent: '24px',
    textTransform: 'uppercase',
    margin: '0 auto',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}))
