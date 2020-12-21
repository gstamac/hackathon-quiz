import { makeStyles, Theme } from '@material-ui/core'

interface Props {
  disabled: boolean
}

export const useStyles =
  makeStyles((theme: Theme) =>
    ({
      buttonWrapper: {
        alignItems: 'center',
        position: 'relative',
      },
      spinner: {
        width: '40px',
        height: '40px',
        position: 'absolute',
        top: '5%',
        right: '30%',
      },
      iconButton: {
        height: '50px',
        width: '50px',
        margin: 'auto',
        marginBottom: theme.spacing(1),
        padding: theme.spacing(1.6),
        borderRadius: '25px',
        background: theme.palette.customColors.electricBlue,
        opacity: (props: Props) =>
          !props.disabled ? 1 : 0.3,
        '&:hover': {
          cursor: (props: Props) => !props.disabled ? 'pointer' : 'unset',
        },
      },

      iconButtonSkeleton: {
        height: '50px',
        width: '50px',
        margin: 'auto',
        marginBottom: theme.spacing(1),
        padding: theme.spacing(1.6),
        borderRadius: '25px',
      },

      iconSize: {
        height: '24px',
      },

      buttonTitle: {
        fontFamily: 'Averta-Semibold',
        maxWidth: '100px',
        minWidth: '100px',
        textAlign: 'center',
        color: theme.palette.customColors.lightGrey,
        margin: 'auto',
        '&:hover': {
          cursor: (props: Props) => !props.disabled ? 'pointer' : 'default',
        },
      },
    })
  )
