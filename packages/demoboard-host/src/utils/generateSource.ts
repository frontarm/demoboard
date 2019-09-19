import { DemoboardGeneratedFile } from '../types/DemoboardGeneratedFile'
import { DemoboardGenerator, DemoboardProjectData } from '../types'

export default function generateSource(
  generators: { [name: string]: DemoboardGenerator },
  generatedFile: DemoboardGeneratedFile,
  pathname: string,
  data: DemoboardProjectData,
): Promise<string | null> {
  let generator = generators[generatedFile.type]
  return generator({
    metadata: data.metadata,
    dependencies: data.dependencies,
    pathnames: Object.keys({ ...data.generatedSources, ...data.sources }),
    pathname,
    props: generatedFile.props || {},
  })
}
