# Decentralized LDBC SNB

A tool to create a **decentralized** version of the [LDBC SNB](https://github.com/ldbc/ldbc_snb_datagen) **social network** dataset, and serve it over HTTP.

## Requirements

* [Bash](https://www.gnu.org/software/bash/) _(Installed by default on UNIX machines)_
* [Git](https://git-scm.com/) _(Installed by default on most UNIX machines)_
* [Node.js](https://nodejs.org/en/) _(1.12 or higher)_
* [Docker](https://www.docker.com/)

## Installation

```bash
$ git clone git@github.com:rubensworks/ldbc-snb-decentralized.git
```

## Usage

### 1. Generate

The social network data can be generated using the default options:

```bash
$ ./prepare.sh
```

**Full usage options:**

```bash
Usage: prepare.sh
Optional flags
  -o       If existing files should be overwritten
  -s       The SNB scale factor (default: 0.1) (possible: 0.1, 1, 3, 10, 30, 100, 300, 1000)
  -e       Path to the enhancement config (default: enhancer-config-dummy.json)
  -f       Path to the fragmentation strategy (default: fragmenter-config-subject.json)
  -g       Path to the enhancement's fragmentation strategy (default: fragmenter-auxiliary-config-subject.json)
  -q       Path to the query instantiation strategy (default: query-config.json)
```

**What does this do?**

This preparation script will first use the (interactive) [LDBC SNB generator](https://github.com/ldbc/ldbc_snb_datagen)
to **create one large Turtle file** with a given scale factor (defaults to `0.1`).

Then, **auxiliary data** will be generated using [`ldbc-snb-enhancer.js`](https://github.com/rubensworks/ldbc-snb-enhancer.js/)
based on the given enhancement config (defaults to an empty config).

Next, this Turtle file will be **fragmented** using [`rdf-dataset-fragmenter.js`](https://github.com/rubensworks/rdf-dataset-fragmenter.js)
and the given fragmentation strategy config (defaults to a subject-based fragmentation).
This happens in two passes:

1. Fragmenting of the main SNB dataset.
1. Fragmenting of the auxiliary SNB dataset.

Finally, **query** templates will be instantiated based on the generated data.
This is done using [`sparql-query-parameter-instantiator.js`](https://github.com/rubensworks/sparql-query-parameter-instantiator.js)
with the given query instantiation config (defaults to a config producing two query types).

### 2. Serve

The fragmented data can be served over HTTP:

```bash
$ ./serve.sh
```

**Full usage options:**

```bash
Usage: serve.sh
Optional flags
  -p       The HTTP port to run on (default: 3000)
  -c       Path to the server config (default: server-config.json)
```

**What does this do?**

The fragmented dataset from the preparation phase is loaded into the [Solid Community Server](https://github.com/solid/community-server/)
so that it can be served over HTTP.

The provided server config uses a simple file-based mapping, so that for example the file in `out-fragments/http/localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/data/pers00000021990232556027` is served on `http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/data/pers00000021990232556027`.
Once the server is live, you can perform requests such as:

```bash
$ curl http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/data/pers00000021990232556027
```

## Data model

By default, the following data model is used where all triples are placed in the document identified by their subject URL.

![](https://raw.githubusercontent.com/ldbc/ldbc_snb_docs/dev/figures/schema-comfortable.png)

For inspiration for possible queries over this dataset,
please refer to the [`interactive-` queries of SNB](https://github.com/ldbc/ldbc_snb_implementations/tree/stable/sparql/queries).
(Note: these queries will require changes to their URLs before they can be used)

## License

This software is written by [Ruben Taelman](https://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
