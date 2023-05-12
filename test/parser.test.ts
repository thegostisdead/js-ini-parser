import { it, describe, expect } from 'vitest'

import { parseIni, Section, stringifyIni, addSection, addKeyValue, addComment, getSection, updateKeyValue } from '../src'



describe('Parser core', () => {

  it('Core functions should exist', () => {
    expect(parseIni).to.exist
    expect(stringifyIni).to.exist

    expect(parseIni).to.be.a('function')
    expect(stringifyIni).to.be.a('function')
  })


  it('Should have a section named DATABASE', () => {
    const obj = parseIni(sampleIni4, {
      allowGlobalSection: true,
      globalSectionName: 'global',
    })

    expect(stringifyIni(obj, {})).to.equal("[DATABASE]\nport=8000\nhost=127.0.0.1")


  })

  it('Should not have a section named global', () => {
    const obj = parseIni(sampleIni4, {
      allowGlobalSection: false,
      globalSectionName: 'global',
    })
    expect(obj[0].section).to.not.equal('global')
  })

  it('Should have a section named other', () => {
    const obj = parseIni(sampleIni5, {
      allowGlobalSection: true,
      globalSectionName: 'other',
    })
    expect(stringifyIni(obj, {})).to.equal('[other]\nhello=world\n[DATABASE]\nport=8000\nhost=127.0.0.1')
  })

  it('It should generate text from parsed object', () => {
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

  it('It should be able to handle comments', () => {

    const iniObj = parseIni(commentsIni, { allowGlobalSection: true});
    const output = stringifyIni(iniObj, {})
    console.log(output)
    expect(output).to.equal("; last modified 1 April 2001 by John Doe\n[super]\n; superman\nname=Homelander\norganization=Vought\n; info 1 \n; info 2")

  })

})


describe("Utility functions", () => {
  it("It should create a new section", () => {
    const iniObj = parseIni(testFile, {});
    addSection(iniObj, "database")

    const output = stringifyIni(iniObj, {})

    expect(output).to.equal('[version]\nversion=1.1.1\n[server]\nhost=182.15.36.95\nport=8080\n[database]')
  })


  it("It should add a new key when needed", () => {
    const iniObj = parseIni(testFile, {});
    addKeyValue(iniObj, "server",  "database", "mongo", { override : false})

    const output = stringifyIni(iniObj, {})
    expect(output).to.equal('[version]\nversion=1.1.1\n[server]\nhost=182.15.36.95\nport=8080\ndatabase=mongo')
    expect(() => {
      addKeyValue(iniObj, "xserver",  "database", "mongo", { override : false})
    }).toThrowError("Section xserver not found")

    const iniObj2 = parseIni(testFile, {});

    expect(() => {
      addKeyValue(iniObj2, "server",  "port", "9999", { override : false})
    }).toThrowError(`Key port already exists in section server, see options.override`)

    expect(stringifyIni(iniObj2, {})).to.equal('[version]\nversion=1.1.1\n[server]\nhost=182.15.36.95\nport=8080')
  })

  it("It should add a new comment in a section", () => {
    const iniObj = parseIni(testFile, {});
    addComment(iniObj, "server", "This should be 1.1.1.1 in production", { attachToKey: "host"} )
    expect(stringifyIni(iniObj, {})).to.equal('[version]\nversion=1.1.1\n[server]\n;This should be 1.1.1.1 in production\nhost=182.15.36.95\nport=8080')

    const iniObj2 = parseIni(testFile, {});
    addComment(iniObj2, "version", "Next version comming soon!", {} )
    expect(stringifyIni(iniObj, {})).to.equal('[version]\nversion=1.1.1\n;Next version comming soon!\n[server]\nhost=182.15.36.95\nport=8080')

  })

  it("It should update a key/value", () => {
    const iniObj = parseIni(testFile, {});
    updateKeyValue(iniObj, "version", "version", "1.2.0")
  })
});