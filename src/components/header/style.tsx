import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headerButton: {
      borderRadius: '22px',
      height: '40px',
      margin: '0px 8px',
      fontFamily: 'Averta-Semibold',
      fontSize: '12px',
      textTransform: 'none',
    },

    loginButton: {
      backgroundColor: theme.palette.customColors.electricBlue,
      color: theme.palette.customColors.white,
      width: '85px',
    },

    registerButton: {
      color: theme.palette.customColors.black,
      borderColor: theme.palette.customColors.washedGrey,
      width: '93px',
    },

    header: {
      width: '100%',
      zIndex: 1,
      borderBottom: `1px solid ${theme.palette.customColors.transparentWhite}`,
    },

    innerHeader: {
      '& img': {
        [theme.breakpoints.down('sm')]: {
          visibility: 'visible',
        },
        visibility: 'hidden',
      },
      display: 'flex',
      padding: theme.spacing(1.5),
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
  }),
)
