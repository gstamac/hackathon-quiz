import React from 'react'
import { useStyles } from './styles'

export interface SkeletonWrapperProps {
  className?: string
  loading?: boolean
}
export type SkeletonState = {
  loading: boolean
}
// eslint-disable-next-line @typescript-eslint/naming-convention
const SkeletonLoadingContext = React.createContext<SkeletonState | undefined>(undefined)

export const useSkeletonState = (): SkeletonState | undefined => React.useContext(SkeletonLoadingContext)

export const SkeletonProvider: React.FC<SkeletonWrapperProps> = (props: React.PropsWithChildren<SkeletonWrapperProps>) => {
  const classes = useStyles()

  const {
    className,
    loading,
    children,
  } = props

  return (
    <SkeletonLoadingContext.Provider value={{loading: loading ?? false}}>
      <div className={`${loading ? classes.skeletonContainer : className ?? ''}`}>
        {children}
      </div>
    </SkeletonLoadingContext.Provider>)
}
