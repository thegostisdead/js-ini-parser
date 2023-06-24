import { parseIni, stringifyIni } from './index'

const sampleIni4 = `
[hello]
world=1
`

const obj = parseIni(sampleIni4, {
  allowGlobalSection: true,
  globalSectionName: 'global',
})

console.dir(obj)

const res = stringifyIni(obj, {})
console.log(res)
