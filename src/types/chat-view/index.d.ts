declare module 'react-chatview' {

  interface ReactChatViewProps {
    className: string
    flipped: boolean
    reversed: boolean
    scrollLoadThreshold: number
    onInfiniteLoad: () => Promise<void>
    shouldTriggerLoad: Function
    returnScrollable(scrollable: HTMLDivElement): void
  }

  const ReactChatView: React.FC<LottieProps>

  export default ReactChatView
}
