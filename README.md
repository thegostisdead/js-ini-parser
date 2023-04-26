<div align="center">

# `ini parser `

A ***simple parser*** for **ini** files. Preserve comments and support global section.
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

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
import { parseIni } from "js-ini-parser";

// CommonJS
const { parseIni } = require("js-ini-parser");
```

## Usage

### API
- parseIni(text, options)
- stringifyIni(object, options)


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

```ts

import { parse, stringify } from "js-ini-parser";
import { parseJsDocOfNode } from 'tsutils'

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

// edit object
parsed.server.host = 'localhost'

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

[github-actions-src]: https://img.shields.io/github/workflow/status/thegostisdead/js-ini-parser/ci/main?style=flat-square
[github-actions-href]: https://github.com/thegostisdead/js-ini-parser/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/gh/thegostisdead/js-ini-parser/main?style=flat-square
[codecov-href]: https://codecov.io/gh/thegostisdead/js-ini-parser