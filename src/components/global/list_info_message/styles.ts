import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  listInfoMessageWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2.5),
  },
  listInfoMessage: {
    fontFamily: 'Averta-Regular',
    fontSize: '15px',
    lineHeight: '18px',
    color: theme.palette.customColors.midGray,
  },
}))
