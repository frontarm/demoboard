/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import JSZip from 'jszip'

interface DemoboardExporterOptions {
  transformedModules: any
}

export default async function demoboardExporterBasic({
  transformedModules,
}: DemoboardExporterOptions) {
  let zip = new JSZip()

  for (let [name, transpiledModule] of Object.entries(transformedModules)) {
    let originalCode = (transpiledModule as any).originalCode
    zip.file(name, originalCode)
  }

  return zip.generateAsync({ type: 'blob' })
}
