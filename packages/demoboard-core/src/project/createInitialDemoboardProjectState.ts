/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { from, Text } from 'automerge'
import {
  DemoboardPanelType,
  DemoboardProjectConfig,
  DemoboardProjectState,
} from '../types'
import { createHistory, getCurrentLocation } from '../utils/history'
import { DemoboardGeneratedFile } from '../types/DemoboardGeneratedFile'

const DefaultExporter = { type: 'basic' }
const DefaultGeneratedSources: {
  [pathname: string]: DemoboardGeneratedFile
} = {
  '/index.html': { type: 'index-html' },
  '/markdown.css': { type: 'markdown-css' },
}
const DefaultIndexPathnames = ['/index.html', '/index.mdx', '/index.md']

const InitialURLPattern = /README\.(mdx?|html)/

export default function createInitialDemoboardProjectState<
  PanelType extends DemoboardPanelType = DemoboardPanelType
>(config: DemoboardProjectConfig<PanelType>): DemoboardProjectState<PanelType> {
  let {
    initialActiveTemplate: activeTemplate = null,
    initialClosedTabs = [],
    initialDependencies: dependencies = {},
    initialExporter: exporter = DefaultExporter,
    initialFallbackToRootIndex: fallbackToRootIndex = true,
    initialGeneratedTabs = [],
    initialHistory,
    initialIndexPathnames: indexPathnames = DefaultIndexPathnames,
    initialMetadata = {},
    initialMocks: mocks = {},
    initialPanelPriorityOrder: panelPriorityOrder = [
      'navigation',
      'tabs',
      'iframe',
      'source',
    ] as PanelType[],
    initialSelectedTab,
    initialSources,
    initialTabs,
    initialTemplates,
    initialURL,
  } = config

  let metadata: { [key: string]: Text } = {}
  for (let key of Object.keys(initialMetadata)) {
    metadata[key] = new Text()
    metadata[key].insertAt!(0, ...initialMetadata[key])
  }
  let staticSourcePathnames = new Set<string>()
  let secondarySourcePathnames = new Set(Object.keys(DefaultGeneratedSources))
  let sources: { [pathname: string]: Text | DemoboardGeneratedFile } = {
    ...DefaultGeneratedSources,
  }
  for (let pathname of Object.keys(initialSources)) {
    let source = initialSources[pathname]
    if (typeof source === 'string') {
      let text = new Text()
      text.insertAt!(0, ...initialSources[pathname])
      sources[pathname] = text
      staticSourcePathnames.add(pathname)
    } else {
      sources[pathname] = source || new Text()
      secondarySourcePathnames.add(pathname)
    }
  }

  let templates: {
    [templateName: string]: {
      [pathname: string]: string | DemoboardGeneratedFile
    }
  } = {
    initial: initialSources,
    ...initialTemplates,
  }

  let indexPathname = Array.from(staticSourcePathnames)
    .concat(Array.from(secondarySourcePathnames))
    .find(x => indexPathnames.indexOf(x) !== -1)

  let defaultSources = Array.from(staticSourcePathnames)
    .concat(initialGeneratedTabs)
    .filter(x => initialClosedTabs.indexOf(x) === -1)

  let tabs = initialTabs || defaultSources
  let selectedTab = initialSelectedTab || tabs[0]
  let url =
    initialURL ||
    tabs.find(name => InitialURLPattern.test(name)) ||
    (indexPathname ? '/' : selectedTab)
  let history = initialHistory || createHistory(url)

  return {
    unpersistedCodeMirrorDocs: {},
    data: from({
      dependencies,
      exporter,
      fallbackToRootIndex,
      indexPathnames,
      metadata,
      mocks,
      sources,
      templates,
    }),
    view: from({
      activeTemplate,
      history,
      locationBar: getCurrentLocation(history).uri,
      panelPriorityOrder,
      selectedTab,
      tabs,
    }),
  }
}
