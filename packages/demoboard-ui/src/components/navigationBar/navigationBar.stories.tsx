/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { action } from '@storybook/addon-actions'
import { NavigationBar } from './navigationBar'

export default {
  title: 'NavigationBar',
}

export const noHistory = () => (
  <NavigationBar
    canGoBack={false}
    canGoForward={false}
    displayedLocation="/"
    onNavigateForward={action('navigateForward')}
    onNavigateBack={action('navigateBack')}
    onRefresh={action('refresh')}
    onChangeDisplayedLocation={action('changeDisplayedLocation')}
    onGoToDisplayedLocation={action('goToDisplayedLocation')}
  />
)

export const hasHistory = () => (
  <NavigationBar
    canGoBack
    canGoForward
    displayedLocation="/"
    onNavigateForward={action('navigateForward')}
    onNavigateBack={action('navigateBack')}
    onRefresh={action('refresh')}
    onChangeDisplayedLocation={action('changeDisplayedLocation')}
    onGoToDisplayedLocation={action('goToDisplayedLocation')}
  />
)
