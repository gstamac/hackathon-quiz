declare module 'lottie-react' {

  interface LottieProps {
    animationData: object
    loop: boolean
    autoplay: boolean
    className?: string
    ref: React.RefObject | React.MutableRefObject
  }

  const Lottie: React.FC<LottieProps>

  export { LottiePlayer, useLottie }

  export default Lottie
}
