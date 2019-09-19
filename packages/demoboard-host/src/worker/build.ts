import { DemoboardWorkerBuildResult, DemoboardTranspiler } from '../types'
import { normalizeReferencedPathname } from '../utils/normalizeReferencedPathname'
import { DemoboardBuildError } from '../build/DemoboardBuildErrors'

const availableTranspilers: [
  RegExp,
  () => Promise<{ transpile: DemoboardTranspiler }>
][] = [
  [/\.mdx?$/, () => import('./transforms/mdx')],
  [/\.scss$/, () => import('./transforms/sass')],
  [/\.css$/, () => import('./transforms/css')],
  [/\.module.css$/, () => import('./transforms/cssModule')],
  [/\.pretty.jsx?$/, () => import('./transforms/babel')],
  [/\.m?jsx?$/, () => import('./transforms/babel')],
]

const builders = {} as {
  [demoboardId: string]: DemoboardBuilder
}

export async function build(
  demoboardId: string,
  sources: { [filename: string]: string },
  viewerPathname: string,
  generators: { [filename: string]: string },
  mocks: { [module: string]: string },
): Promise<DemoboardWorkerBuildResult> {
  let builder = builders[demoboardId]
  if (!builder) {
    builder = builders[demoboardId] = new DemoboardBuilder()
  }
  return builder.build(sources, viewerPathname)
}

export async function clearBuildCache(demoboardId: string): Promise<void> {
  delete builders[demoboardId]
}

export class DemoboardBuilder {
  lastLiveDependencies: any
  lastLivePathname: any
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
    this.lastLivePathname = null

    // Store which live sources are dependent on each file, so we can
    // recompute live sources when their dependents change.
    this.lastLiveDependencies = {}
  }

  async build(
    sources: { [filename: string]: string },
    viewerPathname: string,
  ): Promise<DemoboardWorkerBuildResult> {
    let transformedSources = {}
    let recomputeLive = false
    if (this.lastLivePathname !== viewerPathname) {
      this.lastLiveDependencies = {}
      recomputeLive = !!viewerPathname
    }

    const transpiledModules = {}

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
            transpiledModule = await this.transpileOne(
              filename,
              sources[filename],
            )
          } catch (transpilationError) {
            error = transpilationError
          }

          if (
            filename === viewerPathname ||
            this.lastLiveDependencies[filename]
          ) {
            recomputeLive = true
          }
        }

        dependencies.push(
          ...((transpiledModule && transpiledModule.dependencies) || []),
        )

        let originalCode = sources[filename]
        transformedSources[filename] =
          transpiledModule &&
          (transpiledModule.prettyCode || transpiledModule.code)
        transpiledModules[normalizeReferencedPathname(filename)] =
          transpiledModule === null
            ? { code: sources[filename], dependencies: [], originalCode }
            : transpiledModule
      }

      if (error) {
        return {
          transformedSources,
          transpiledModules,
          error: error,
        }
      }

      if (recomputeLive) {
        this.lastLiveDependencies = {}
        for (let dependency of dependencies) {
          this.lastLiveDependencies[dependency] = true
        }
        shouldRegenerateHTML = true
      }

      this.lastSources = sources
      this.lastTransformerResults = transpiledModules
    } catch (error) {
      console.error('An error occured while building a demoboard:', error)
      return {
        transformedSources,
        transpiledModules,
        error: new DemoboardBuildError(
          (error && error.name) || 'Error',
          null,
          error && error.message,
        ),
      }
    }

    return { transformedSources, transpiledModules, shouldRegenerateHTML }
  }

  private async transpileOne(filename: string, code: string) {
    let transpiledSource = {
      code,
      filename,
      dependencies: [],
      originalCode: code,
    }

    // Start fetching any new transpilers before starting the transpilation
    let applicableTranspilerPromises: Promise<DemoboardTranspiler>[] = []
    for (let [pattern, moduleGetter] of availableTranspilers) {
      if (pattern.test(filename)) {
        applicableTranspilerPromises.push(moduleGetter().then(getTranspiler))
      }
    }

    for (let transpilerPromise of applicableTranspilerPromises) {
      transpiledSource = await (await transpilerPromise)(transpiledSource)
    }

    return transpiledSource
  }
}

const getTranspiler = ({ transpile }: { transpile: DemoboardTranspiler }) =>
  transpile
