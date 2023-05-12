import type { Block, ParserOptions, Section, IniObject, AddSectionOptions, AddCommentOptions } from './types'

const DEFAULT_SECTION_NAME = ''

export function parseIni(text: string, options: ParserOptions): IniObject {
  const sections = [] as Section[]
  let currentSection: Section | undefined
  let currentBlock: Block | undefined
  let globalSection: Section | undefined

  if (options.allowGlobalSection) {
    globalSection = {
      section: options.globalSectionName || DEFAULT_SECTION_NAME,
      blocks: []
    }

  }

  const lines = text.split('\n').filter( a => a !=="" )

  for (let index = 0; index < lines.length; index++) {

    const currentLine = lines[index]
    const trimmedLine = currentLine.trim()

    if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
      // Start a new section
      currentSection = { section: trimmedLine.slice(1, -1), blocks: [] }
      sections.push(currentSection)
      currentBlock = undefined
    } else if (trimmedLine.startsWith(';')) { // Add a comment block

      if (index === 0) {
        console.log("index is 0 and i'm a comment")
        // Add a comment block to the global section if it exists and is the first line of the file
        if (globalSection) {
          globalSection.blocks.push({ type: 'comment', text: trimmedLine })
        }
      } else if (index < lines.length - 1) {
        const nextLine = lines[index + 1]
        const trimmedNextLine = nextLine.trim()
        const isNextLineKeyVal = trimmedNextLine.indexOf('=') !== -1

        if (isNextLineKeyVal) {

          if (currentSection) {
            currentSection.blocks.push({ type: 'comment', text: trimmedLine })
          } else if (globalSection) {
            globalSection.blocks.push({ type: 'comment', text: trimmedLine })
          }
        }
      }


    } else if (currentSection) {
      // Parse key-value pairs

      const separatorIndex = trimmedLine.indexOf('=')

      if (separatorIndex !== -1) {
        const key = trimmedLine.slice(0, separatorIndex).trim()
        const value = trimmedLine.slice(separatorIndex + 1).trim()

        currentBlock = { type: 'data', key, value }

        // search for a key-value pair in the previous line
        if (index > 0) {
          const previousLine = lines[index - 1]
          const trimmedPreviousLine = previousLine.trim()

          // a comment is found in the previous line so we link it to the current block
          if (trimmedPreviousLine.startsWith(';')) {
            currentBlock.comment = { type: 'comment', text: trimmedPreviousLine }
          }
        }

        currentSection.blocks.push(currentBlock)

      } else if (currentBlock && currentBlock.type === 'comment') {
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
  sections: IniObject,
  options: ParserOptions
): string {

  const lines = [] as string[]
  console.log(sections)
  for (const section of sections) {
    lines.push(`[${section.section}]`)
    for (const block of section.blocks) {
      if (block.type === "data") {
        // bloc linked
        if (block.comment && block.comment.type === "comment") {
          lines.push(`${block.comment.text}`)
          lines.push(`${block.key}=${block.value}`)
        } else {   // bloc simple
          lines.push(`${block.key}=${block.value}`)
        }
      } else if (block.type === "comment"){ // bloc comment
        lines.push(`${block.text}`)
      }
    }
  }
  return lines.join('\n')
}

export function addSection(
  obj: IniObject,
  sectionName: string,
): Section {
  obj.push({ section: sectionName, blocks: [] })
  return { section: sectionName, blocks: [] }
}


export function addKeyValue(
  obj: IniObject,
  section: string,
  key: string,
  value: string,
  options: AddSectionOptions
): Block {

  const targetSection = obj.find(s => s.section === section)

  if (!targetSection) {
    throw new Error(`Section ${section} not found`)
  }

  // we found the section, now check if key exists in the section
  const block = targetSection.blocks.find(b => b.type === "data" && b.key === key)

  if (block) {
    if (options?.override) {
      if (block && block.type === "data") {
        block.value = value
      }
      return block
    }
    throw new Error(`Key ${key} already exists in section ${section}, see options.override`)
  }

  // key does not exist, add it
  targetSection.blocks.push({ type: "data", key, value })
  return { type: "data", key, value }

}

export function addComment(
  obj: IniObject,
  section: string,
  comment: string,
  options: AddCommentOptions
): Block {

    comment = ";" + comment
    const targetSection = obj.find(s => s.section === section)

    if (!targetSection) {
      throw new Error(`Section ${section} not found`)
    }

    // we found the section, now check if key exists in the section
    if (options?.attachToKey) {
      const keyPosition = targetSection.blocks.findIndex(b => b.type === "data" && b.key === options.attachToKey)
      const commentPosition = keyPosition - 1

      targetSection.blocks.splice(commentPosition, 0, { type: "comment", text: comment });
      console.log(targetSection)
      return targetSection.blocks[commentPosition]
    }

    targetSection.blocks.push({ type: "comment", text: comment })
    return { type: "comment", text: comment }
}

export function getSection(
  sections: Section[],
  sectionName: string
): Section | undefined {
  return sections.find(section => section.section === sectionName)
}

export function updateKeyValue(obj: IniObject, section: string, key: string, value: string) {
  const targetSection = obj.find(s => s.section === section)

  if (!targetSection) {
    throw new Error(`Section ${section} not found`)
  }

  // we found the section, now check if key exists in the section
  const block = targetSection.blocks.find(b => b.type === "data" && b.key === key)

  if (block && block.type === "data") {
    block.value = value
    return block
  }

  throw new Error(`Key ${key} not found in section ${section}. Can't update.`)
}

export type { Block, ParserOptions, Section, IniObject, AddCommentOptions, AddSectionOptions } from './types'
