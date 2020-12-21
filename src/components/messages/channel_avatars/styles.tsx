import { makeStyles, Theme } from '@material-ui/core/styles'

const channelAvatarSize = {
  width: '56px',
  height: '56px',
}

export const useStyles = makeStyles(
  {
    channelAvatar: channelAvatarSize,
    avatarWrapper: {
      ...channelAvatarSize,
      borderRadius: 6,
    },
  },
)

interface MultiAvatarStyleProps {
  size?: number
  color?: string
}

export const useMultiAvatarStyles = makeStyles((theme: Theme) => (
  {
    avatarWrapper: {
      ...channelAvatarSize,
      position: 'relative',
    },
    channelMultiAvatar: {
      width: ({ size }: MultiAvatarStyleProps) => size ? `${size}px` : '38px',
      height: ({ size }: MultiAvatarStyleProps) => size ? `${size}px` : '38px',
    },
    channelFrontMultiAvatar: {
      width: ({ size }: MultiAvatarStyleProps) => size ? `${size + 6}px` : '38px',
      height: ({ size }: MultiAvatarStyleProps) => size ? `${size + 6}px` : '38px',
      border: ({ color }: MultiAvatarStyleProps) => `3px solid ${color ?? theme.palette.common.white}`,
    },
    channelSecondAvatarPosition: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
    channelFirstAvatarPosition: {
      position: 'absolute',
      bottom: 0,
      left: 0,
    },
    participantsCount: {
      backgroundColor: theme.palette.customColors.white,
      width: '24px',
      height: '24px',
      color: theme.palette.customColors.black,
      fontFamily: 'Averta-Semibold',
      fontSize: '10px',
      lineHeight: '14px',
      display: 'flex',
      alignItems: 'center',
      textAlign: 'center',
      letterSpacing: '0.1px',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.0995138)',
      position: 'absolute',
    },

    badgePosition: {
      right: '17%',
      bottom: '17%',
    },
  }),
)
