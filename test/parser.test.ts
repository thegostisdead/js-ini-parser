import { it, describe, expect } from 'vitest'

import {
  parseIni,
  stringifyIni,
  Section,
  Line,
  addSection,
  updateKeyValue,
  addComment,
  addKeyValue,
} from '../src'

describe('Line class', () => {
  it('should wrap index and text', () => {
    const line = new Line('test', 0)
    expect(line.text).to.equal('test')
    expect(line.number).to.equal(0)
  })

  it('should detect comments', () => {
    expect(new Line(';test', 0).isComment()).to.equal(true)
    expect(new Line('; test', 0).isComment()).to.equal(true)
  })

  it('should detect sections', () => {
    expect(new Line('[qsdsqd sdqsd]', 0).isSection()).to.equal(true)
  })

  it('should detect key/val', () => {
    expect(new Line('a=a', 0).isKeyValuePair()).to.equal(true)
    expect(new Line('hello=world', 0).isKeyValuePair()).to.equal(true)
  })

  it('should detect a complex key val', function () {
    expect(
      new Line('URL={params}/test?value={app}&location=', 0).isKeyValuePair()
    ).to.equal(true)
  })

  it('should not detect key/val', () => {
    expect(new Line('=', 0).isKeyValuePair()).to.equal(false)
    expect(new Line('=a', 0).isKeyValuePair()).to.equal(false)
    expect(new Line('', 0).isKeyValuePair()).to.equal(false)
    expect(new Line('test=', 0).isKeyValuePair()).to.equal(false)
  })

  it('should detect empty key/val', () => {
    expect(new Line('key=', 0).isEmptyKeyValuePair()).to.equal(true)
    expect(new Line('test=', 0).isEmptyKeyValuePair()).to.equal(true)
  })
})

describe('Parser core', () => {
  it.concurrent('Core functions should exist', () => {
    expect(parseIni).to.exist
    expect(stringifyIni).to.exist

    expect(parseIni).to.be.a('function')
    expect(stringifyIni).to.be.a('function')
  })

  it.concurrent('Should have a section named DATABASE', () => {
    const text = `
    [DATABASE]
    port=8000
    host=127.0.0.1
    `

    const obj = parseIni(text, {
      allowGlobalSection: true,
      globalSectionName: 'global',
    })

    expect(stringifyIni(obj, {})).to.equal(
      '[DATABASE]\nport=8000\nhost=127.0.0.1'
    )
  })

  it.concurrent('Should not have a section named global', () => {
    const text = ''
    const obj = parseIni(text, {
      allowGlobalSection: false,
      globalSectionName: 'global',
    })

    const res = stringifyIni(obj, {})
    expect(res).to.equal('')
  })

  it.concurrent('Should support multiple equals', () => {
    const text = `
    [DATABASE]
    URL={params}/test?value={app}&location=
    host=127.0.0.1
    `

    const obj = parseIni(text, {
      allowGlobalSection: false,
    })

    const res = stringifyIni(obj, {})

    expect(res).to.equal(
      '[DATABASE]\nURL={params}/test?value={app}&location=\nhost=127.0.0.1'
    )
  })

  it.concurrent('Should not have a section named global', () => {
    const text = '[server]\naccess=public'
    const obj = parseIni(text, {
      allowGlobalSection: false,
      globalSectionName: 'global',
    })

    const res = stringifyIni(obj, {})
    expect(res).to.equal('[server]\naccess=public')
  })

  it.concurrent('Should have a section named other', () => {
    const text = `
    [other]
    hello=world
    [DATABASE]
    port=8000
    host=127.0.0.1
    `
    const obj = parseIni(text, {
      allowGlobalSection: true,
      globalSectionName: 'other',
    })

    const res = stringifyIni(obj, {})

    expect(res).to.equal(
      '[other]\nhello=world\n[DATABASE]\nport=8000\nhost=127.0.0.1'
    )
  })

  it.concurrent('It should generate text from parsed object', () => {
    // TODO - I don't like this test, it's too coupled to the implementation details
    const parsedObj = [] as Section[]

    parsedObj.push({
      section: 'package',
      blocks: [
        {
          type: 'data',
          key: 'name',
          value: 'ini-parser',
        },
        {
          type: 'data',
          key: 'version',
          value: '1.0.0',
        },
      ],
    } as Section)

    const res = stringifyIni(parsedObj, {})
    expect(res).to.equal(`[package]\nname=ini-parser\nversion=1.0.0`)
  })

  it.concurrent('It should be able to handle comments', () => {
    const commentsIni = `
    [super]
    ; superman
    name=Homelander
    organization=Vought
    ; info 1 
    ; info 2
    `
    const iniObj = parseIni(commentsIni, {
      allowGlobalSection: false,
    })
    const output = stringifyIni(iniObj, {})

    expect(output).to.equal(
      '[super]\n; superman\nname=Homelander\norganization=Vought\n; info 1\n; info 2'
    )
  })

  it.concurrent('It should be able to support empty value', () => {
    const testFile = `
    [server]
    host=
    port=8080
    `

    const iniObj = parseIni(testFile, {
      allowGlobalSection: false,
      allowEmptyValue: true,
    })
    const output = stringifyIni(iniObj, {})

    expect(output).to.equal('[server]\nhost=\nport=8080')
  })

  it.concurrent('It should ignore when empty value is disabled', () => {
    const testFile = `
    [server]
    host=
    port=8080
    `

    const iniObj = parseIni(testFile, {
      allowGlobalSection: false,
      allowEmptyValue: false,
      debug: true,
    })
    const output = stringifyIni(iniObj, {})
    expect(output).to.equal('[server]\nport=8080')
  })
})

describe('Utility functions', () => {
  it('It should create a new section', () => {
    const testFile = ``
    const iniObj = parseIni(testFile, {})
    addSection(iniObj, 'database')

    const output = stringifyIni(iniObj, {})

    expect(output).to.equal('[database]')

    const a = parseIni('[database]', {})
    addSection(a, 'test')
    expect(stringifyIni(a, {})).to.equal('[database]\n[test]')
  })

  it('It should update a key/value', () => {
    const testFile = `
    [version]
    version=1.1.1
    [server]
    host=
    `
    const iniObj = parseIni(testFile, {
      allowGlobalSection: true,
      allowEmptyValue: true,
    })
    updateKeyValue(iniObj, 'version', 'version', '1.2.0')

    expect(stringifyIni(iniObj, {})).to.equal(
      '[version]\nversion=1.2.0\n[server]\nhost='
    )
  })

  it('It should add a new comment in a section', () => {
    const testFile = `
    [server]
    `
    const iniObj = parseIni(testFile, {
      debug: false,
    })

    addComment(iniObj, 'server', 'This should be 1.1.1.1 in production', {
      attachToKey: 'host',
    })

    expect(stringifyIni(iniObj, {})).to.equal(
      '[server]\n;This should be 1.1.1.1 in production'
    )

    const iniObj2 = parseIni(`[server]\nhost=1.1.1.1`, {})
    addComment(iniObj2, 'server', 'Next version comming soon!', {})
    expect(stringifyIni(iniObj2, {})).to.equal(
      '[server]\nhost=1.1.1.1\n;Next version comming soon!'
    )
  })

  // TODO - implement error handling

  // it('It should add a new key when needed', () => {
  //   const testFile = `
  //   [server]
  //   [xserver]
  //   `
  //   const iniObj = parseIni(testFile, {})
  //   addKeyValue(iniObj, 'server', 'database', 'mongo', { override: false })
  //
  //   const output = stringifyIni(iniObj, {})
  //   expect(output).to.equal('[server]\ndatabase=mongo')
  //   expect(() => {
  //     addKeyValue(iniObj, 'xserver', 'database', 'mongo', { override: false })
  //   }).toThrowError('Section xserver not found')
  //
  //   const iniObj2 = parseIni(testFile, {})
  //
  //   expect(() => {
  //     addKeyValue(iniObj2, 'server', 'port', '9999', { override: false })
  //   }).toThrowError(
  //     `Key port already exists in section server, see options.override`
  //   )
  //
  //   expect(stringifyIni(iniObj2, {})).to.equal(
  //     '[version]\nversion=1.1.1\n[server]\nhost=182.15.36.95\nport=8080'
  //   )
  // })
})
