export const delay = async (ms: number): Promise<void> => new Promise((
  resolve: (value?: void | PromiseLike<void>) => void,
): number => setTimeout(resolve, ms))
