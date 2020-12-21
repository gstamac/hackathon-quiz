export interface UseVideoCallResponse {
  initiateVideoCallCallback: () => Promise<void>
  isInitializingVideoCall: boolean
}
