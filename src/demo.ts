import { parseIni } from './index'

const sampleIni4 = ``

const obj = parseIni(sampleIni4, {
  allowGlobalSection: true,
  globalSectionName: 'global',
})

console.dir(obj)

for (const section of obj) {
  console.log(`[${section.section}]`)
  for (const block of section.blocks) {
    if (block.type === 'comment') {
      console.log(`; ${block.text}`)
    } else {
      console.log(`${block.key}=${block.value}`)
    }
  }
}
