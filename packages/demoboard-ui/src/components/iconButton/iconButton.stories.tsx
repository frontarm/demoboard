/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { action } from '@storybook/addon-actions'
import { IconButton } from './iconButton'

export default {
  title: 'IconButton',
}

export const raised = () => (
  <IconButton glyph="add" raised onClick={action('clicked')} />
)
