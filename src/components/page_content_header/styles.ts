import { makeStyles, createStyles, Theme } from '@material-ui/core'

interface Props {
  border: boolean
}

export const useStyles =
  makeStyles((theme: Theme) => createStyles({
    titleHeader: {
      height: '76px',
      fontFamily: 'Averta-Semibold',
      fontSize: '22px',
      letterSpacing: '0.523308px',
      [theme.breakpoints.down('xs')]: {
        paddingTop: theme.spacing(1.5),
      },
      paddingTop: theme.spacing(1),
      background: theme.palette.customColors.white,
      position: 'relative',
      boxShadow: (props: Props) => props.border ? `0px 0px 10px ${theme.palette.customColors.shadowGrey}` : 'none',
    },

    titleLogo: {
      marginRight: theme.spacing(3),
    },
  })
  )
