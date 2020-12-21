import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => {

  const { skeletonLightGray, skeletonDarkGray } = theme.palette.customColors

  return {
    skeletonContainer: {
      transform: 'none',
      backgroundColor: skeletonLightGray,

      '& div': {
        backgroundColor: skeletonLightGray,
      },
    },
    skeletonContent: {
      transform: 'none',
      backgroundColor: skeletonDarkGray,
      alignSelf: 'center',
    },

    skeletonRect: {
      borderRadius: '4px',
    },

    wrapperDiv: {
      display: 'inherit',
      flexDirection: 'inherit',
    },
  }
})
