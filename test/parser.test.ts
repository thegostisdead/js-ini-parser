import { it, describe, expect } from 'vitest'

import { parseIni } from '../src'

const sampleIni = `
; last modified 1 April 2001 by John Doe
[owner]
name=John Doe
organization=Acme Widgets Inc.
`

const sampleIni2 = `
; last modified 1 April 2001 by John Doe
[server]
port=8000
; in production, use 8443 
host=127.0.0.1
; in production, use app.domain.com 
`

const sampleIni3 = `
[PRINT]
;Port=LABEL:
PrinterMode=EMULATION
PrinterContentFormat={@}{@}
PositionFormat=40,8,0,2
TextFormat=240,18,0,1,1,3,N
TextFormatTop=40,76,0,1,1,2,N
TextFormatBot=40,114,0,1,1,2,N
; Printer width in pixels
PrinterWidth=1205
; PrinterWidth height in pixels
`

const sampleIni4 = `
[DATABASE]
port = 8000
host = 127.0.0.1
`

describe('ini parser library', () => {
  it('parseIni should exist', () => {
    expect(parseIni).to.exist
  })

  it('parseIni should be a function', () => {
    expect(parseIni).to.be.a('function')
  })

  it('parseIni should return an array', () => {
    expect(
      parseIni(sampleIni, {
        allowGlobalSection: true,
        globalSectionName: 'global',
      })
    ).to.be.an('array')
  })

  it('parseIni should return an array of length 2', () => {
    expect(
      parseIni(sampleIni, {
        allowGlobalSection: true,
        globalSectionName: 'global',
      })
    ).to.have.lengthOf(2)
  })

  it('parseIni should return an array of length 1', () => {
    expect(parseIni(sampleIni, { allowGlobalSection: false })).to.have.lengthOf(
      1
    )
  })

  it('parseIni should return an array of length 1', () => {
    expect(
      parseIni(sampleIni2, { allowGlobalSection: false })
    ).to.have.lengthOf(1)
  })

  it('parseIni should have 4 blocks', () => {
    expect(
      parseIni(sampleIni2, { allowGlobalSection: false })[0].blocks
    ).to.have.lengthOf(4)
  })

  it('parseIni should have 10 blocks', () => {
    expect(
      parseIni(sampleIni3, { allowGlobalSection: false })[0].blocks
    ).to.have.lengthOf(10)
  })

  it('parseIni should have 2 blocks', () => {
    expect(
      parseIni(sampleIni4, { allowGlobalSection: false })[0].blocks
    ).to.have.lengthOf(2)
  })

  it('parseIni should have 2 blocks', () => {
    expect(
      parseIni(sampleIni4, { allowGlobalSection: false })[0].blocks
    ).to.have.lengthOf(2)
  })

  it('parseIni on sampleIni4 should have 0 blocks on global', () => {
    expect(
      parseIni(sampleIni4, {
        allowGlobalSection: true,
        globalSectionName: 'global',
      })[0].blocks
    ).to.have.lengthOf(0)
  })

  it('parseIni on sampleIni4 should have 2 blocks on DATABASE', () => {
    expect(
      parseIni(sampleIni4, {
        allowGlobalSection: true,
        globalSectionName: 'global',
      })[1].blocks
    ).to.have.lengthOf(2)
  })

  it('parseIni on sampleIni4 should have a section named DATABASE', () => {
    const obj = parseIni(sampleIni4, {
      allowGlobalSection: true,
      globalSectionName: 'global',
    })
    expect(obj[1].section).to.equal('DATABASE')
    expect(obj[0].section).to.equal('global')
  })

  it('parseIni on sampleIni4 should not have a section named global', () => {
    const obj = parseIni(sampleIni4, {
      allowGlobalSection: false,
      globalSectionName: 'global',
    })
    expect(obj[0].section).to.not.equal('global')
  })

  it('parseIni on sampleIni4 should have a section named other', () => {
    const obj = parseIni(sampleIni4, {
      allowGlobalSection: true,
      globalSectionName: 'other',
    })
    expect(obj[0].section).to.equal('other')
  })
})
