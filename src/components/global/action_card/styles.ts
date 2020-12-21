import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  actionCardRoot: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionCardDetails: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'flex-end',
    minWidth: '0',
    paddingBottom: '7px',
    [theme.breakpoints.down('xs')]: {
      paddingBottom: '5px',
    },
    paddingLeft: '21px',
  },
  actionCardTitle: {
    color: theme.palette.customColors.grey,
    fontFamily: 'Averta-Bold',
    fontSize: '20px',
    letterSpacing: '0.1px',
    lineHeight: '25px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '159px',
  },
  actionCardSubtitle: {
    color: theme.palette.customColors.midGray,
    fontFamily: 'Averta-Regular',
    fontSize: '11px',
    lineHeight: '14px',
    width: '159px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineClamp: 2,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
  },
  actionCardLink: {
    color: theme.palette.customColors.electricBlue,
    fontSize: '12px',
    fontFamily: 'Averta-Semibold',
    lineHeight: '15px',
    paddingTop: '5px',
    [theme.breakpoints.down('xs')]: {
      paddingTop: '3px',
    },
    '&:hover': {
      cursor: 'pointer',
    },
  },
  hiddenMembersLink: {
    cursor: 'default',
    color: theme.palette.customColors.transparentLightBlue,
  },
}))
