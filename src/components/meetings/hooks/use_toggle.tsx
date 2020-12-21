/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import { UseToggle } from './interfaces'

export const useToggle = (initialState: boolean): UseToggle => {
  const [isActive, setIsActive] = useState<boolean>(initialState)

  const toggle = (): void => {
    setIsActive(!isActive)
  }

  return {
    isActive,
    toggle,
  }
}
