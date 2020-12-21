import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  quickMenuRoot: {
    '& .MuiPopover-paper': {
      padding: theme.spacing(2),
    },
  },
  quickMenuCompactRoot: {
    '& .MuiPopover-paper': {
      padding: theme.spacing(1, 0),
    },
  },
  quickMenuLoaderWrapper: {
    display: 'flex',
    minHeight: 90,
    '& div':{
      margin: 'auto',
    },
  },
  quickMenuItem: {
    '&.MuiListItem-root': {
      minHeight: '46px',
      whiteSpace: 'normal',
    },
    '&.MuiListItem-divider': {
      borderBottom: 'none',
      '&:not(:last-child):after': {
        content: '""',
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      },
    },
    '& .MuiListItemIcon-root': {
      marginLeft: '11px',
      marginRight: '16px',
      minHeight: '24px',
      minWidth: '24px',
      alignItems: 'center',
    },
    '& .MuiListItemText-root': {
      marginRight: '11px',
    },
    '& .MuiListItemText-primary': {
      fontFamily: 'Averta-Bold',
    },
  },
}))
