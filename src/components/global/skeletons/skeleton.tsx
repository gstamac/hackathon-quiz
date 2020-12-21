import React, { PropsWithChildren } from 'react'
import {
  SkeletonProps as SkeletonMuiProps,
  Skeleton as SkeletonMui,
} from '@material-ui/lab'
import { useStyles } from './styles'
import { useSkeletonState } from './skeleton_provider'

export interface SkeletonPartialProps extends SkeletonMuiProps {
  className?: string
  loading?: boolean
  component?: React.ElementType
  radius?: number
  wrapperClassName?: string
  ignoreSkeleton?: boolean
}

export type SkeletonProps = PropsWithChildren<SkeletonPartialProps>

type skeletonSizeType = string | number | undefined

const getWidthAndHeight = (
  width: skeletonSizeType,
  height: skeletonSizeType,
  radius?: number,
): [skeletonSizeType, skeletonSizeType] => {
  const skeletonSize: string | undefined =
    radius !== undefined ? `${2 * radius}px` : undefined

  return [skeletonSize ?? width, skeletonSize ?? height]
}

export const Skeleton: React.FC<SkeletonProps> = (props: SkeletonProps) => {
  const classes = useStyles()

  const {
    className,
    loading,
    component,
    radius,
    wrapperClassName,
    width: skeletonWidth,
    height: skeletonHeight,
    children,
    variant,
    ignoreSkeleton,
    onClick,
    ...skeletonProps
  }: SkeletonProps = props

  const skeletonWrapperState = useSkeletonState()

  const isSkeletonLoading = skeletonWrapperState?.loading ?? loading

  if ((ignoreSkeleton || !isSkeletonLoading) &&
    children !== undefined) {
    return <div className={wrapperClassName} onClick={onClick}>{children}</div>
  }

  const [width, height] = getWidthAndHeight(
    skeletonWidth,
    skeletonHeight,
    radius,
  )

  const skeletonClass: string = variant === 'rect' ? classes.skeletonRect : ''

  return (
    <SkeletonMui
      {...skeletonProps}
      animation='wave'
      variant={variant}
      component={component ?? 'span'}
      data-testid='skeleton'
      height={height}
      width={width}
      className={`${classes.skeletonContent} ${classes.wrapperDiv} ${skeletonClass} ${className ?? ''}`}
    />
  )
}
