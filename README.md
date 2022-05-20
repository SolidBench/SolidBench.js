# Decentralized LDBC SNB

A tool to create a **decentralized** version of the [LDBC SNB](https://github.com/ldbc/ldbc_snb_datagen_hadoop) **social network** dataset, and serve it over HTTP.

[![Build status](https://github.com/rubensworks/ldbc-snb-decentralized.js/workflows/CI/badge.svg)](https://github.com/rubensworks/ldbc-snb-decentralized.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/ldbc-snb-decentralized.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/ldbc-snb-decentralized.js?branch=master)
[![npm version](https://badge.fury.io/js/ldbc-snb-decentralized.svg)](https://www.npmjs.com/package/ldbc-snb-decentralized)

## Requirements

* [Node.js](https://nodejs.org/en/) _(1.14 or higher)_
* [Docker](https://www.docker.com/) _(required for invoking [LDBC SNB generator](https://github.com/ldbc/ldbc_snb_datagen_hadoop))_

## Installation

```bash
$ npm install -g ldbc-snb-decentralized
```
or
```bash
$ yarn global add ldbc-snb-decentralized
```

## Quick start

1. `$ ldbc-snb-decentralized generate`: Generate dataset with default options.
2. `$ ldbc-snb-decentralized serve`: Serve datasets over HTTP
3. Initiate HTTP requests over `http://localhost:3000/`, such as `$ curl http://localhost:3000/pods/00000000000000000933/profile/card`

## Usage

### 1. Generate

The social network data can be generated using the default options:

```bash
$ ldbc-snb-decentralized generate
```

**Full usage options:**

```bash
ldbc-snb-decentralized.js generate

Generate social network data

Options:
      --version                    Show version number                 [boolean]
      --cwd                        The current working directory
                                                           [string] [default: .]
      --verbose                    If more output should be printed    [boolean]
      --help                       Show help                           [boolean]
  -o, --overwrite                  If existing files should be overwritten
                                                       [string] [default: false]
  -s, --scale                      The SNB scale factor  [number] [default: 0.1]
  -e, --enhancementConfig          Path to enhancement config
                                  [string] [default: enhancer-config-dummy.json]
  -f, --fragmentConfig             Path to fragmentation config
                              [string] [default: fragmenter-config-pod.json]
  -g, --enhancementFragmentConfig  Path to enhancement's fragmentation config
                    [string] [default: fragmenter-auxiliary-config-subject.json]
  -q, --queryConfig                Path to query instantiation config
                                           [string] [default: query-config.json]
      --hadoopMemory               Memory limit for Hadoop
                                                        [string] [default: "4G"]
```

**What does this do?**

This preparation script will first use the (interactive) [LDBC SNB generator](https://github.com/ldbc/ldbc_snb_datagen_hadoop)
to **create one large Turtle file** with a given scale factor (defaults to `0.1`, allowed values: `[0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000]).

Then, **auxiliary data** will be generated using [`ldbc-snb-enhancer.js`](https://github.com/rubensworks/ldbc-snb-enhancer.js/)
based on the given enhancement config (defaults to an empty config).

Next, this Turtle file will be **fragmented** using [`rdf-dataset-fragmenter.js`](https://github.com/rubensworks/rdf-dataset-fragmenter.js)
and the given fragmentation strategy config (defaults to a [Solid-pod](https://solidproject.org/)-based fragmentation).
This happens in two passes:

1. Fragmenting of the main SNB dataset.
1. Fragmenting of the auxiliary SNB dataset.

Finally, **query** templates will be instantiated based on the generated data.
This is done using [`sparql-query-parameter-instantiator.js`](https://github.com/rubensworks/sparql-query-parameter-instantiator.js)
with the given query instantiation config (defaults to a config instantiating [all LDBC SNB interactive queries](https://github.com/rubensworks/ldbc-snb-decentralized.js/tree/master/templates/queries)).

### 2. Serve

The fragmented data can be served over HTTP:

```bash
$ ldbc-snb-decentralized serve
```

**Full usage options:**

```bash
ldbc-snb-decentralized.js serve

Serves the fragmented dataset via an HTTP server

Options:
      --version   Show version number                                  [boolean]
      --cwd       The current working directory            [string] [default: .]
      --verbose   If more output should be printed                     [boolean]
      --help      Show help                                            [boolean]
  -p, --port      The HTTP port to run on               [number] [default: 3000]
  -c, --config    Path to server config   [string] [default: server-config.json]
  -l, --logLevel  Logging level (error, warn, info, verbose, debug, silly)
                                                      [string] [default: "info"]
```

**What does this do?**

The fragmented dataset from the preparation phase is loaded into the [Solid Community Server](https://github.com/solid/community-server/)
so that it can be served over HTTP.

The provided server config uses a simple file-based mapping, so that for example the file in `out-fragments/http/localhost:3000/pods/00000000000000000933/profile/card` is served on `http://localhost:3000/pods/00000000000000000933/profile/card`.
Once the server is live, you can perform requests such as:

```bash
$ curl http://localhost:3000/pods/00000000000000000933/profile/card
```

## Data model

By default, the following data model is used where all triples are placed in the document identified by their subject URL.

![](https://raw.githubusercontent.com/ldbc/ldbc_snb_docs/dev/figures/schema-comfortable.png)

Query templates can be found in [`templates/queries/`](https://github.com/rubensworks/ldbc-snb-decentralized.js/tree/master/templates/queries).

## License

This software is written by [Ruben Taelman](https://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
