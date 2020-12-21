declare module 'RootType' {
  import { StateType } from 'typesafe-actions'
  type RootState = StateType<typeof import('./store/store').rootReducer>
  import { ThunkDispatch as ThunkDispatchStore} from 'redux-thunk'
  import { Action } from 'redux'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ThunkDispatch = ThunkDispatchStore<RootState, any, Action>
  type ThunkAPI = { getState: () => RootState, dispatch: ThunkDispatch }
}

declare type AsnycFn<T> = () => Promise<T>
declare type Fn<T> = () => T

declare type UFn<T> = AsnycFn<T> | Fn<T>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare type Predicate = (value: any) => boolean

declare type HTMLElementEvent<T, K> = Omit<HTMLElementEventMap[K], 'target'> & {
  target: T | null
}
