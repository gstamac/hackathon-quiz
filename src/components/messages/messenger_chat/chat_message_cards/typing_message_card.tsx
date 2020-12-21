import React, { ForwardRefExoticComponent, Ref } from 'react'
import Lottie from 'lottie-react'
import typingAnimation from '../../../../assets/json/typing_animation.json'
import { useMessageGroupingStyles } from './styles'
import { TypingMessageCardProps } from './interfaces'

export const TypingMessageCard: ForwardRefExoticComponent<TypingMessageCardProps> = React.forwardRef((props: TypingMessageCardProps, ref: Ref<HTMLDivElement>) => {

  const classes = useMessageGroupingStyles({
    isSideSeparated: false,
    iAmAuthor: false,
    prevIsSystemMessage: false,
  })

  return (
    <div className={classes.typingCard}>
      <img className={classes.userImage} src={props.avatar} alt='user avatar' />
      <div data-testid={'typing-animation'} className={classes.typing}>
        <Lottie
          animationData={typingAnimation}
          loop={true}
          autoplay={true}
          ref={ref}
        />
      </div>
    </div>
  )
})
