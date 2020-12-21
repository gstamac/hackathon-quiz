import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  headerWrapper: {
    height: '76px',
    paddingTop: theme.spacing(3),
    textAlign: 'center',
    position: 'relative',
  },
  infoField: {
    display: 'flex',
    flexDirection: 'column',
  },
  participantsText: {
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
  },
  titleText: {
    color: theme.palette.customColors.midGray,
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
}))
