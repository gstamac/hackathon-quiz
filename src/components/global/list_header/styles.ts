import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  listHeaderPadding: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },

  title: {
    fontFamily: 'Averta-Bold',
    fontSize: '16px',
    lineHeight: '19px',
    color: theme.palette.customColors.washedBlack,
    marginTop: theme.spacing(3),
    marginBottom: '20px',
  },
}))
