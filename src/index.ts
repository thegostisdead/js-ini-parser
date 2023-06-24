import type {
  Block,
  ParserOptions,
  Section,
  IniObject,
  AddSectionOptions,
  AddCommentOptions,
} from './types'

const DEFAULT_SECTION_NAME = ''

export class Line {
  constructor(public text: string, public number: number) {
    this.text = text
    this.number = number
  }

  isComment(): boolean {
    return this.text.startsWith(';')
  }

  isSection(): boolean {
    return this.text.startsWith('[') && this.text.endsWith(']')
  }

  isEmptyKeyValuePair(): boolean {
    if (this.text.length <= 1) {
      return false
    }

    if (this.isComment() || this.isSection()) {
      return false
    }

    const [, v] = this.text.trim().split('=')
    return v === undefined || v === ''
  }

  isKeyValuePair(): boolean {
    // TODO : improve this
    if (this.isEmptyKeyValuePair()) {
      return false
    }

    const hasEqualSign = this.text.indexOf('=') !== -1

    if (!hasEqualSign) {
      return false
    }

    const startsWithEqualSign = this.text.startsWith('=')

    if (startsWithEqualSign) {
      return false
    }

    if (this.text.trim().split('=').length === 2) {
      return (
        hasEqualSign &&
        !startsWithEqualSign &&
        !this.isComment() &&
        !this.isSection()
      )
    }

    if (this.isComment() && this.isSection()) {
      return false
    }

    return !startsWithEqualSign
  }
}

/**
 * Parse an ini file and return an object
 * @param text The ini file content to parse as a string (required)
 * @param {Object} options - The parser options (optional)
 * @param {Boolean} options.allowGlobalSection - allow a section named global (default: false)
 * @param {String} options.globalSectionName - the name of the global section (default: '')
 * @param {Boolean} options.allowEmptyValue - allow empty values (default: false) When false, empty values will be ignored
 * @returns The parsed object
 *
 */
export function parseIni(text: string, options: ParserOptions): IniObject {
  const sections = [] as Section[]
  let currentSection: Section | undefined
  let currentBlock: Block | undefined
  let globalSection: Section | undefined
  let debug = console.debug

  if (options.debug !== true) {
    debug = () => {}
  }

  if (options.allowGlobalSection) {
    globalSection = {
      section: options.globalSectionName || DEFAULT_SECTION_NAME,
      blocks: [],
    }
  }

  const lines = text.split('\n').filter(a => a.trim() !== '')

  for (let index = 0; index < lines.length; index++) {
    const currentLine = lines[index]
    const trimmedLine = new Line(currentLine.trim(), index)

    if (trimmedLine.isSection()) {
      // Start a new section
      currentSection = { section: trimmedLine.text.slice(1, -1), blocks: [] }
      sections.push(currentSection)
      currentBlock = undefined
    } else if (trimmedLine.isComment()) {
      // 2 possible cases at this stage :
      // a - the comment is alone (here)
      // b - the comment is linked to a key-value pair

      if (index < lines.length - 1) {
        const nextLine = lines[index + 1]
        const trimmedNextLine = new Line(nextLine.trim(), index + 1)

        if (trimmedNextLine.isKeyValuePair()) {
          // do nothing because the comment is linked to a key-value pair and will be handled later in the loop
          debug('comment linked to a key-value pair')
          debug(`l:${index}  ${trimmedLine.text}`)
        } else if (currentSection) {
          currentSection.blocks.push({
            type: 'comment',
            text: trimmedLine.text,
          })
        } else if (options.allowGlobalSection && globalSection) {
          globalSection.blocks.push({ type: 'comment', text: trimmedLine.text })
        } else {
          console.error(`Error at line ${index} : comment outside of section`)
          console.error(`l:${index}  ${trimmedLine.text}`)
        }
      } else {
        debug('last line of the file')
        if (currentSection) {
          currentSection.blocks.push({
            type: 'comment',
            text: trimmedLine.text,
          })
        } else if (options.allowGlobalSection && globalSection) {
          globalSection.blocks.push({ type: 'comment', text: trimmedLine.text })
        } else {
          console.error(`Error at line ${index} : comment outside of section`)
          console.error(`l:${index}  ${trimmedLine.text}`)
        }
      }
    } else if (currentSection) {
      // search for key-value pairs
      const isKeyValuePair = trimmedLine.isKeyValuePair()
      debug('isKeyValuePair', isKeyValuePair)
      if (isKeyValuePair) {
        const separatorIndex = trimmedLine.text.indexOf('=')

        const key = trimmedLine.text.slice(0, separatorIndex).trim()
        const value = trimmedLine.text.slice(separatorIndex + 1).trim()

        currentBlock = { type: 'data', key, value }

        // try to search for a K/V pair in the previous line
        if (index === 0) {
          // do nothing
        } else if (index > 0) {
          const previousLine = lines[index - 1]
          const trimmedPreviousLine = new Line(previousLine.trim(), index - 1)

          // a comment is found in the previous line, so we link it to the current block
          if (trimmedPreviousLine.isComment()) {
            currentBlock.comment = {
              type: 'comment',
              text: trimmedPreviousLine.text,
            }
          }
        }

        currentSection.blocks.push(currentBlock)
      } else if (trimmedLine.isEmptyKeyValuePair()) {
        if (options.allowEmptyValue) {
          debug(
            'empty key value pair at line ' + index + ' : ' + trimmedLine.text
          )
          const separatorIndex = trimmedLine.text.indexOf('=')

          currentBlock = {
            type: 'data',
            key: trimmedLine.text.slice(0, separatorIndex).trim(),
            value: '',
          }
          currentSection.blocks.push(currentBlock)
        } else {
          console.error(
            `Empty value at ${index}. This line should have a value.`
          )
          console.error(`Line content: ${trimmedLine.text}`)
        }
      } else {
        console.error(
          `Invalid line ${index}. This line should be a key-value pair.`
        )
        console.error(`Line content: ${trimmedLine.text}`)
      }
    } else if (options.allowGlobalSection && globalSection) {
      sections.push(globalSection)
    } else {
      console.warn(`Ignoring data outside of section`)
      console.warn(`l:${index}  ${trimmedLine.text}`)
    }
  }

  return sections
}

/**
 * Stringify a parsed object to an ini string
 * @param sections {IniObject} - the parsed object to stringify to ini
 * @param options {ParserOptions} - the options to use for the parser (default: {})
 */
export function stringifyIni(
  sections: IniObject,
  options: ParserOptions
): string {
  const lines = [] as string[]

  for (const section of sections) {
    lines.push(`[${section.section}]`)
    for (const block of section.blocks) {
      if (block.type === 'data') {
        // bloc linked
        if (block.comment && block.comment.type === 'comment') {
          lines.push(`${block.comment.text}`)
          lines.push(`${block.key}=${block.value}`)
        } else {
          // bloc simple
          lines.push(`${block.key}=${block.value}`)
        }
      } else if (block.type === 'comment') {
        // bloc comment
        lines.push(`${block.text}`)
      }
    }
  }
  return lines.join('\n')
}

export function addSection(obj: IniObject, sectionName: string): Section {
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
  const block = targetSection.blocks.find(
    b => b.type === 'data' && b.key === key
  )

  if (block) {
    if (options?.override) {
      if (block && block.type === 'data') {
        block.value = value
      }
      return block
    }
    throw new Error(
      `Key ${key} already exists in section ${section}, see options.override`
    )
  }

  // key does not exist, add it
  targetSection.blocks.push({ type: 'data', key, value })
  return { type: 'data', key, value }
}

export function addComment(
  obj: IniObject,
  section: string,
  comment: string,
  options: AddCommentOptions
): Block {
  comment = ';' + comment
  const targetSection = obj.find(s => s.section === section)

  if (!targetSection) {
    throw new Error(`Section ${section} not found`)
  }

  // we found the section, now check if key exists in the section
  if (options?.attachToKey) {
    const keyPosition = targetSection.blocks.findIndex(
      b => b.type === 'data' && b.key === options.attachToKey
    )
    const commentPosition = keyPosition - 1

    targetSection.blocks.splice(commentPosition, 0, {
      type: 'comment',
      text: comment,
    })
    // console.log(targetSection)
    return targetSection.blocks[commentPosition]
  }

  targetSection.blocks.push({ type: 'comment', text: comment })
  return { type: 'comment', text: comment }
}

export function getSection(
  sections: Section[],
  sectionName: string
): Section | undefined {
  return sections.find(section => section.section === sectionName)
}

export function updateKeyValue(
  obj: IniObject,
  section: string,
  key: string,
  value: string
) {
  const targetSection = obj.find(s => s.section === section)

  if (!targetSection) {
    throw new Error(`Section ${section} not found`)
  }

  // we found the section, now check if key exists in the section
  const block = targetSection.blocks.find(
    b => b.type === 'data' && b.key === key
  )

  if (block && block.type === 'data') {
    block.value = value
    return block
  }

  throw new Error(`Key ${key} not found in section ${section}. Can't update.`)
}

export type {
  Block,
  ParserOptions,
  Section,
  IniObject,
  AddCommentOptions,
  AddSectionOptions,
} from './types'
