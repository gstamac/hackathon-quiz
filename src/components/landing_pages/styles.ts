import { makeStyles, Theme, createStyles } from '@material-ui/core'

export const useStyles =
  makeStyles((theme: Theme) =>
    createStyles({
      contentWrapper:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: theme.spacing(6.5),
        position: 'relative',
      },

      backgroundPic:{
        height: 353,
        width: 369,
        [theme.breakpoints.between('sm','md')]:{
          height: 250,
          width: 250,
        },
        [theme.breakpoints.down('sm')]:{
          height: 200,
          width: 200,
        },
      },

      backgroundPicExtra:{
        height: 353,
        width: 369,
        [theme.breakpoints.down('md')]:{
          height: 180,
          width: 180,
        },
      },

      downloadArea:{
        marginTop: theme.spacing(6),
        textAlign: 'center',
      },

      scanIcon:{
        [theme.breakpoints.down('md')]:{
          height: 180,
          width: 180,
        },
      },

      storeIcons: {
        marginTop: theme.spacing(3),
      },

      upperMargin:{
        marginTop: theme.spacing(6),
      },

      comingSoon: {
        maxWidth:'288px',
        marginTop: theme.spacing(6.6),
        fontFamily: 'Averta-Bold',
        fontSize: '20px',
        lineHeight: '23px',
        textAlign: 'center',
        wordBreak: 'break-word',
      },

      description: {
        maxWidth: '400px',
        marginTop: theme.spacing(3),
        color: theme.palette.customColors.midGray,
        fontFamily: 'Averta-Regular',
        fontSize: '15px',
        lineHeight: '18px',
        textAlign: 'center',
        [theme.breakpoints.down('xs')]:{
          paddingRight: theme.spacing(4),
          paddingLeft: theme.spacing(4),
        },
      },

      walletDescriptionBottomPadding: {
        paddingBottom: theme.spacing(6),
      },

      flexColumn: {
        display: 'flex',
        flexDirection: 'column',
      },

      groupsDemoLink: {
        fontSize: '18px',
        color: theme.palette.customColors.electricBlue,
        textDecoration: 'none',
        lineHeight: '40px',
        fontFamily: 'Averta-Bold',
      },

      encryptionResend: {
        fontSize: '14px',
        color: theme.palette.customColors.electricBlue,
        textDecoration: 'none',
        '&:hover': {
          cursor: 'pointer',
        },
      },

      buttonText: {
        fontSize: '16px',
      },

      buttonWidth: {
        '&.MuiButton-root': {
          width: '180px',
        },
      },

      enableEncryptionButtonWidth: {
        width: '240px',
      },

      enableEncryptionButtonUpperMargin: {
        marginTop: theme.spacing(3),
      },

      appsLinksContainer: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(5),
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        width: '123px',
      },

      googlePlayButton: {
        paddingTop: theme.spacing(0.5),
      },

      centerLoader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      },

      chatContainer: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        height: '100vh',
        width: 'min-content',
      },

      paddingTopGroupChat: {
        paddingTop: theme.spacing(16),
      },

      paddingTopGoToGroups: {
        paddingTop: theme.spacing(17),
      },
    })
  )
