/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'

import { DevicePermissionStatus } from '../enums'
import { Card } from '../components/card'
import { getString } from '../../../utils'
import { useDevicePermissionStatus } from '../hooks/use_device_permission_status'
import {
  Modal,
  ModalBody,
  ModalHeader,
} from 'amazon-chime-sdk-component-library-react'
import { emptyCallback } from '../../../constants'

export const DevicePermissionPrompt: React.FC = () => {
  const permission: string = useDevicePermissionStatus()

  return permission === DevicePermissionStatus.IN_PROGRESS ? (
    <Modal
      size='md'
      onClose={emptyCallback}
      rootId='device-permission-modal-root'
    >
      <ModalHeader
        title={getString('meeting-permissions-check')}
        displayClose={false}
      />
      <ModalBody>
        <Card
          title={getString('meeting-unable-to-get-labels')}
          description={
            <>
              <p>
                {getString('meeting-permissions-check-description-pt1')}
              </p>
              <p>
                {getString('meeting-permissions-check-description-pt2')} <strong>{getString('meeting-permissions-check-description-pt3')}</strong>
              </p>
            </>
          }
        />
      </ModalBody>
    </Modal>
  ) : null
}
