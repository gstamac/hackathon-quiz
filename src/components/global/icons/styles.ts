import { IconInterface } from './interfaces'
import { makeStyles } from '@material-ui/core/styles'

const iconSize = 30

export const usePrivateIconStyles = makeStyles({
  privateIcon: {
    width: iconSize,
    height: iconSize,
    margin: (props: IconInterface) => props.size ? (props.size-iconSize)/2 : '10px',
  },
  privateIconHolder: {
    marginRight: 'auto',
    marginLeft: 'auto',
    borderRadius: '50%',
    width: (props: IconInterface) => props.size ?? '50px',
    height: (props: IconInterface) => props.size ?? '50px',
    boxShadow: '0px 11px 18px rgba(0, 0, 0, 0.15)',
  },
})
