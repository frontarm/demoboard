/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react'
import { action } from '@storybook/addon-actions'
import { OpenTabList } from './openTabList'

export default {
  title: 'OpenTabList',
}

export const SingleTab = () => (
  <OpenTabList
    onClose={action('close')}
    onSelect={action('select')}
    selected="/App.js"
    tabs={['/App.js']}
  />
)

export const TwoTabs = () => {
  const [selected, setSelected] = useState<string | null>('/App.js')

  return (
    <OpenTabList
      onClose={action('close')}
      onSelect={setSelected}
      selected={selected}
      tabs={['/App.js', '/index.js']}
    />
  )
}
