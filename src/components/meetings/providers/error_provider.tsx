/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, PropsWithChildren } from 'react'

const context = React.createContext({
  errorMessage: '',
  updateErrorMessage: (_: string) => {},
})

export const getErrorContext = (): typeof context => context

export const ErrorProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const ErrorContext = getErrorContext()

  const updateErrorMessage = (message: string): void => {
    setErrorMessage(message)
  }

  const providerValue = {
    errorMessage,
    updateErrorMessage,
  }

  return (
    <ErrorContext.Provider value={providerValue}>
      {children}
    </ErrorContext.Provider>
  )
}
