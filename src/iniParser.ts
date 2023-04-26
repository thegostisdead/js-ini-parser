type Block =
  | { type: 'comment'; text: string }
  | { type: 'data'; key: string; value: string }
type Section = { section: string; blocks: Block[] }

type ParserOptions = {
  allowGlobalSection?: boolean
  globalSectionName?: string
}

export function parseIni(text: string, options: ParserOptions): Section[] {
  const sections: Section[] = []
  let currentSection: Section | undefined
  let currentBlock: Block | undefined
  let globalSection: Section | undefined

  if (options.allowGlobalSection && options.globalSectionName) {
    globalSection = { section: options.globalSectionName || '', blocks: [] }
  }

  for (const line of text.split('\n')) {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
      // Start a new section
      currentSection = { section: trimmedLine.slice(1, -1), blocks: [] }
      sections.push(currentSection)
      currentBlock = undefined
    } else if (trimmedLine.startsWith(';')) {
      // Add a comment block
      if (currentSection) {
        currentBlock = { type: 'comment', text: trimmedLine }
        currentSection.blocks.push(currentBlock)
      } else if (options.allowGlobalSection) {
        globalSection.blocks.push({ type: 'comment', text: trimmedLine })
      } else {
        // Ignoring comment outside of section
      }
    } else if (currentSection) {
      // Parse key-value pairs
      const separatorIndex = trimmedLine.indexOf('=')
      if (separatorIndex !== -1) {
        const key = trimmedLine.slice(0, separatorIndex).trim()
        const value = trimmedLine.slice(separatorIndex + 1).trim()
        currentBlock = { type: 'data', key, value }
        currentSection.blocks.push(currentBlock)
      } else if (currentBlock && currentBlock.type === 'comment') {
        // Append to previous comment block
        currentBlock.text += '\n' + trimmedLine
      }
    } else if (options.allowGlobalSection && globalSection) {
      sections.push(globalSection)
    } else {
      // Ignoring data outside of section
    }
  }

  return sections
}

export function stringifyIni(
  sections: Section[],
  options: ParserOptions
): string {
  console.log(sections, options)
  throw new Error('Not implemented') // TODO implement
}
