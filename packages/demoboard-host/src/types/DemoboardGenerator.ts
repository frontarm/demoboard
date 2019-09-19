export interface DemoboardGeneratorOptions {
  metadata: any
  dependencies: {
    [packageName: string]: string
  }
  pathname: string
  pathnames: string[]
  props: any
}

/**
 * Return a string, or `null` in case the source should not be generated.
 */
export type DemoboardGenerator = (
  options: DemoboardGeneratorOptions,
) => Promise<string | null>
