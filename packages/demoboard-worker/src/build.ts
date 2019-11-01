/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import {
  DemoboardWorkerBuildResult,
  DemoboardWorkerTransform,
  DemoboardWorkerTransformedModule,
} from './types'
import { DemoboardBuildError } from './DemoboardBuildErrors'
import { normalizeReferencedPathname } from './utils/normalizeReferencedPathname'
import { loadTransform } from './loadTransform'

const availableTransformers: [
  RegExp,
  () => Promise<{ default: DemoboardWorkerTransform }>,
][] = [
  [/\.mdx?$/, loadTransform('mdx')],
  [/\.scss$/, loadTransform('sass')],
  [/\.css$/, loadTransform('css')],
  [/\.module.css$/, loadTransform('cssModule')],
  [/\.m?jsx?$/, loadTransform('babel')],
]

const builders = {} as {
  [demoboardId: string]: DemoboardBuilder
}

export async function build(options: {
  id: string
  sources: { [filename: string]: string }
  entryPathname: string
}): Promise<DemoboardWorkerBuildResult> {
  let { id, sources, entryPathname } = options

  let builder = builders[id]
  if (!builder) {
    builder = builders[id] = new DemoboardBuilder()
  }
  return builder.build(sources, entryPathname)
}

export async function clearBuildCache(demoboardId: string): Promise<void> {
  delete builders[demoboardId]
}

export class DemoboardBuilder {
  lastEntryDependencies: any
  lastEntryPathname: any
  lastSources: any
  lastTransformerResults: any

  constructor() {
    // Each time we receive a source, we compare it against the last known
    // value to check if we can skip any further builds.
    this.lastSources = {}

    // Eventually I may want to apply prettify on this (but not on prepared
    // sources).
    this.lastTransformerResults = {}

    // Live sources have the HTML transform run if necessary, with all
    // appropriate scripts bundled (if necessary) and injected.
    this.lastEntryPathname = null

    // Store which live sources are dependent on each file, so we can
    // recompute live sources when their dependents change.
    this.lastEntryDependencies = {}
  }

  async build(
    sources: { [filename: string]: string },
    viewerPathname: string,
  ): Promise<DemoboardWorkerBuildResult> {
    let recomputeLive = false
    if (this.lastEntryPathname !== viewerPathname) {
      this.lastEntryDependencies = {}
      recomputeLive = !!viewerPathname
    }

    const transformedModules = {} as {
      [name: string]: DemoboardWorkerTransformedModule
    }

    let error
    let dependencies = []
    let shouldRegenerateHTML = false
    try {
      const filenames = Object.keys(sources)
      for (let filename of filenames) {
        const source = sources[filename]
        let transpiledModule

        if (source === this.lastSources[filename]) {
          transpiledModule = this.lastTransformerResults[filename]
        } else {
          try {
            transpiledModule = await this.transformOne(
              filename,
              sources[filename],
            )
          } catch (transpilationError) {
            error = transpilationError
          }

          if (
            filename === viewerPathname ||
            this.lastEntryDependencies[filename]
          ) {
            recomputeLive = true
          }
        }

        dependencies.push(
          ...((transpiledModule && transpiledModule.dependencies) || []),
        )

        let originalCode = sources[filename]
        transformedModules[normalizeReferencedPathname(filename)] =
          transpiledModule === null
            ? { code: sources[filename], dependencies: [], originalCode }
            : transpiledModule
      }

      if (error) {
        return {
          shouldRegenerateHTML: false,
          transformedModules,
          error,
        }
      }

      if (recomputeLive) {
        this.lastEntryDependencies = {}
        for (let dependency of dependencies) {
          this.lastEntryDependencies[dependency] = true
        }
        shouldRegenerateHTML = true
      }

      this.lastSources = sources
      this.lastTransformerResults = transformedModules
    } catch (error) {
      console.error('An error occured while building a demoboard:', error)
      return {
        shouldRegenerateHTML: false,
        transformedModules,
        error: new DemoboardBuildError(
          (error && error.name) || 'Error',
          null,
          error && error.message,
        ),
      }
    }

    return { error: null, transformedModules, shouldRegenerateHTML }
  }

  private async transformOne(
    pathname: string,
    originalSource: string,
  ): Promise<DemoboardWorkerTransformedModule> {
    let transformedSource: DemoboardWorkerTransformedModule = {
      css: null,
      map: null,
      transformedSource: originalSource,
      pathname,
      dependencies: [],
      originalSource,
    }

    // Start fetching any new transpilers before starting the transpilation
    let applicableTransformerPromises: Promise<DemoboardWorkerTransform>[] = []
    for (let [pattern, moduleGetter] of availableTransformers) {
      if (pattern.test(pathname)) {
        applicableTransformerPromises.push(moduleGetter().then(getTransformer))
      }
    }

    for (let transformerPromise of applicableTransformerPromises) {
      transformedSource = await (await transformerPromise)(transformedSource)
    }

    return transformedSource
  }
}

const getTransformer = ({
  default: transform,
}: {
  default: DemoboardWorkerTransform
}) => transform
