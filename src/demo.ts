import { parseIni } from './index'

const sampleIni4 = ``

const obj = parseIni(sampleIni4, {
  allowGlobalSection: true,
  globalSectionName: 'global',
})

console.dir(obj)


