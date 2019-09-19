import JSZip from 'jszip'

interface DemoboardExporterOptions {
  transpiledModules: any
}

export default async function demoboardExporterBasic({
  transpiledModules,
}: DemoboardExporterOptions) {
  let zip = new JSZip()

  for (let [name, transpiledModule] of Object.entries(transpiledModules)) {
    let originalCode = (transpiledModule as any).originalCode
    zip.file(name, originalCode)
  }

  return zip.generateAsync({ type: 'blob' })
}
