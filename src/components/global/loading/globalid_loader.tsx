import React, { ForwardRefExoticComponent, Ref } from 'react'
import Lottie from 'lottie-react'
import loadingAnimation from '../../../assets/json/loading_animation.json'
import { useStyles } from './styles'
import { GlobalidLoaderProps } from './interfaces.js'
import clsx from 'clsx'

export const GlobalidLoader: ForwardRefExoticComponent<GlobalidLoaderProps> = React.forwardRef((props: GlobalidLoaderProps, ref: Ref<HTMLDivElement>) => {
  const classes = useStyles({})

  return <div className={clsx(classes.spinner, props.className)} data-testid='globalid-loader' role='spinner'>
    <Lottie
      animationData={loadingAnimation}
      loop={true}
      autoplay={true}
      ref={ref}
    />
  </div>
})
