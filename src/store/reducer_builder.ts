import { ReducerBuilder } from './interfaces'

export const addReducers = <B>(builder: B, reducerBuilders: ReducerBuilder<B>[]): B =>
  reducerBuilders.reduce(bindReducers, builder)

export const bindReducers = <B>(builder: B, reducerBuilder: ReducerBuilder<B>): B =>
  reducerBuilder(builder)
