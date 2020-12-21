import { Theme, makeStyles } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  popoverRoot: {
    '& .MuiPaper-root': {
      background: theme.palette.customColors.white,
    },
    '& .MuiPaper-rounded': {
      borderRadius: 12,
    },
    '& .MuiPopover-paper': {
      boxShadow: `0px 0px 10px ${theme.palette.customColors.transparentBlack}`,
      minWidth: 288,
    },
  },
  popoverCompactRoot: {
    '& .MuiPopover-paper': {
      minWidth: 190,
    },
  },
}))
