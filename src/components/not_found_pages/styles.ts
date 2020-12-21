import { makeStyles, Theme, createStyles } from '@material-ui/core'

export const useStyles =
  makeStyles((theme: Theme) =>
    createStyles({
      pageNotFoundWrapper:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 52,
        position: 'relative',
      },

      backgroundPic:{
        marginTop: '100px',
        height: 353,
        width: 369,
        [theme.breakpoints.between('sm','sm')]:{
          height: 281,
          width: 293,
        },
        [theme.breakpoints.down('xs')]:{
          height: 228,
          width: 238,
        },
      },

      returnToLogin:{
        marginTop: theme.spacing(6),
        textAlign: 'center',
      },

      comingSoon: {
        maxWidth:'278px',
        marginTop: '56px',
        fontFamily: 'Averta-Bold',
        fontSize: '20px',
        lineHeight: '23px',
        textAlign: 'center',
      },

      description: {
        maxWidth: '367px',
        marginTop: '24px',
        color: theme.palette.customColors.lightGrey,
        fontFamily: 'Averta-Regular',
        fontSize: '15px',
        lineHeight: '18px',
        textAlign: 'center',
      },

      buttonText: {
        fontSize: '16px',
      },
    })
  )
