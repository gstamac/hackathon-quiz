import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  participantsWrapper: {
    width: '374px',
    display: 'flex',
    flexDirection: 'row',
    minHeight: theme.spacing(13),
    padding: theme.spacing(2, 2, 0, 2),
    overflowX: 'auto',
    '&:empty': {
      height: '0',
      minHeight: '0',
      padding: '0',
    },
  },
}))
