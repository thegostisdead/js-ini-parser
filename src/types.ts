export type Block =
  | { type: 'comment'; text: string }
  | { type: 'data'; key: string; value: string; comment?: Block }

export type ParserOptions = {
  allowGlobalSection?: boolean
  globalSectionName?: string
  allowEmptyValue?: boolean
  debug?: boolean
}

export type Section = {
  section: string
  blocks: Block[]
}

export type IniObject = Section[]

export type AddSectionOptions = {
  override?: boolean
}

export type AddCommentOptions = {
  attachToKey?: string
}
