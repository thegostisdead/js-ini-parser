<div align="center">

# `ini parser `

A ***simple parser*** for **ini** files. Preserve comments and support global section.    
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![codecov](https://codecov.io/gh/thegostisdead/js-ini-parser/branch/main/graph/badge.svg?token=ZT5QTE59J1)](https://codecov.io/gh/thegostisdead/js-ini-parser)
![example workflow](https://github.com/thegostisdead/js-ini-parser/actions/workflows/main.yml/badge.svg)

</div>

🚧 This project is under development.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)


## Installation
Install package:

```sh
# npm
npm install js-ini-parser

# yarn
yarn add js-ini-parser

# pnpm
pnpm install js-ini-parser
```

Import:

```js
// ESM
import { parseIni, stringifyIni } from "js-ini-parser";

// CommonJS
const { parseIni, stringifyIni } = require("js-ini-parser");
```

## Usage

### API
- parseIni(text, ParserOptions)
- stringifyIni(object, {})

### ParserOptions
- `allowGlobalSection`: `boolean` - Allow global section (default: false)
- `globalSectionName`: `string` - Name of the global section (default: global)
- `allowEmptyValue`: `boolean` - Allow empty value (default: false) 
- `debug`: `boolean` - Enable debug mode (default: false) 

### Parse text input to object
```js
import { parseIni } from "js-ini-parser";

const ini = `
[server]
; this is a comment
host = 
port = 8080
`;

const options = {
  allowGlobalSection: true,
  globalSectionName: 'global'
}

const parsed = parseIni(ini, options);

console.log(parsed);
```

### Parse text from file to object
```ts
import * as fs from "node:fs/promises";
import { parseIni } from "js-ini-parser";


const options = {
  allowGlobalSection: true,
  globalSectionName: 'global'
}

const fileContent = await fs.readFile("./config.ini", "utf-8");
const parsed = parseIni(fileContent, options);


```

### Edit object and convert to text

> ⚠️️ Not available yet but will be soon !   
Currently, you can edit the object manually and stringify it back to text using stringifyIni
> - In the future, you will be able to edit the object using the API (addComment, updateKeyValue, etc...)   
> - Or by accessing to data like this: parsed.server.host = 'localhost'

```ts

import { parse, stringify } from "js-ini-parser";

const ini = `
[server]
; this is a comment
host =
port = 8080
`;

const options = {
  allowGlobalSection: true,
  globalSectionName: 'global'
}

const parsed = parseIni(ini, options);

// convert to text
const text = stringifyIni(parsed, {})
```


## Contributing
- Clone this repository
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`


## License

Published under [MIT License](./LICENSE).

<!-- Badges -->
[npm-version-href]: https://npmjs.com/package/js-ini-parser
[npm-downloads-href]: https://npmjs.com/package/js-ini-parser
[npm-version-src]: https://img.shields.io/npm/v/js-ini-parser?style=flat-square
[npm-downloads-src]: https://img.shields.io/npm/dm/js-ini-parser?style=flat-square
