import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  joinGroupDialogDescription: {
    marginRight: '70px',
  },
  joinGroupDialogInputSwitch: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    '& .MuiFormControlLabel-root': {
      marginRight: theme.spacing(0),
    },
    [theme.breakpoints.up('sm')]: {
      right: '0px',
    },
  },
  joinGroupDialogSwitchWrapper: {
    position: 'relative',
    margin: 'auto',
    marginTop: '24px',
    fontFamily: 'Averta-Regular',
    fontSize: '15px',
    lineHeight: '18px',
    color: theme.palette.customColors.midGray,
    width: '280px',
    placeSelf: 'center',
  },
  joinGroupDialogTitle: {
    textAlign: 'center',
    fontFamily: 'Averta-Bold',
    fontSize: '20px',
    lineHeight: '23px',
    wordBreak: 'break-all',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}))
