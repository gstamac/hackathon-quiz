import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

interface Props {
  active?: boolean
}

export const useStyles =
  makeStyles((theme: Theme) => createStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      cursor: 'pointer',
      width: 120,
      height: 40,
      background: (props: Props) => props.active ?
        theme.palette.customColors.electricBlue : theme.palette.customColors.brightGray,
      borderRadius: 42,
      fontFamily: 'Averta-Regular',
      fontSize: 15,
      color: (props: Props) => props.active ? theme.palette.customColors.white : theme.palette.customColors.black,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.spacing(1.5),
      '& > img': {
        height: 16,
        paddingRight: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
          height: 18,
          paddingRight: 0,
        },
      },
      [theme.breakpoints.down('sm')]: {
        width: 40,
      },
    },
  }))
