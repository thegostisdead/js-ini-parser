export type Block =
  | { type: 'comment'; text: string }
  | { type: 'data'; key: string; value: string }

export type ParserOptions = {
  allowGlobalSection?: boolean
  globalSectionName?: string
}

export type Section = {
  section: string
  blocks: Block[]
}
