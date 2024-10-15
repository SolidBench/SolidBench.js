# Changelog
All notable changes to this project will be documented in this file.

<a name="v2.0.0"></a>
## [v2.0.0](https://github.com/SolidBench/SolidBench.js/compare/v1.7.1...v2.0.0) - 2024-10-15

### BREAKING CHANGES
* [Update @solid/community-server to v7 and fix its usage and tests](https://github.com/SolidBench/SolidBench.js/commit/8f602114062f0b260988ae682924b24c2b2e9d4f)
* [Combine primary and auxiliary fragmentation steps](https://github.com/SolidBench/SolidBench.js/commit/9a1fd817b0b595f2e5e967af4cc02e942cf8c603)

### Changes
* [Bump to rdf-dataset-fragmenter 2.8](https://github.com/SolidBench/SolidBench.js/commit/f59c1eee25b4849a7525a5d403592c2d6e24daf5)
* [Use es2021 as the target to match the lib](https://github.com/SolidBench/SolidBench.js/commit/dd70fdc15b024cfca8db8c4bf321f632f62f2b70)
* [Relocate index.ts to lib/index.ts, update configs to match](https://github.com/SolidBench/SolidBench.js/commit/cad941712a1ecd7e884d97f1018beacc780ed51a)

<a name="v1.7.1"></a>
## [v1.7.1](https://github.com/SolidBench/SolidBench.js/compare/v1.7.0...v1.7.1) - 2023-07-12

### Fixed
* [Disable resource locker in Solid server config (#7)](https://github.com/SolidBench/SolidBench.js/commit/50726f478458a43dd22a149269bdda329cb81d33)

<a name="v1.7.0"></a>
## [v1.7.0](https://github.com/SolidBench/SolidBench.js/compare/v1.6.1...v1.7.0) - 2023-02-14

### Added
* [Add baseUrl and rootFilePath options to serve command](https://github.com/SolidBench/SolidBench.js/commit/3bb872d4c1b58135f14ec085e6d86865ff48137c)

<a name="v1.6.1"></a>
## [v1.6.1](https://github.com/SolidBench/SolidBench.js/compare/v1.6.0...v1.6.1) - 2023-02-08

### Fixed
* [Fix backpressure handling in enhancer](https://github.com/SolidBench/SolidBench.js/commit/664425414c34b533edc66ff720df7c9d112d64da)

<a name="v1.6.0"></a>
## [v1.6.0](https://github.com/SolidBench/SolidBench.js/compare/v1.5.1...v1.6.0) - 2023-02-07

### Added
* [Update to ldbc-snb-enhancer 2.5 with post multiplication support](https://github.com/SolidBench/SolidBench.js/commit/3be244846939231ea3ffeb86fd394e1d370aad2f)

<a name="v1.5.1"></a>
## [v1.5.1](https://github.com/SolidBench/SolidBench.js/compare/v1.5.0...v1.5.1) - 2023-01-31

### Fixed
* [Fix generator failure in Node 14](https://github.com/SolidBench/SolidBench.js/commit/70d47f1da94fa3bedb41c603b39647f3933f05da)

<a name="v1.5.0"></a>
## [v1.5.0](https://github.com/SolidBench/SolidBench.js/compare/v1.4.1...v1.5.0) - 2023-01-31

### Added
* [Expose Post and Comment domain in vocabulary](https://github.com/SolidBench/SolidBench.js/commit/225cdd7bf314dcdb5d6db8efb6359a95f5a5328e)

<a name="v1.4.1"></a>
## [v1.4.1](https://github.com/SolidBench/SolidBench.js/compare/v1.4.0...v1.4.1) - 2022-11-09

### Fixed
* [Include source map files in packed files](https://github.com/SolidBench/SolidBench.js/commit/fd8c4be90382756e87fca285cbb6d5ba332b22a7)

<a name="v1.4.0"></a>
## [v1.4.0](https://github.com/SolidBench/SolidBench.js/compare/v1.3.1...v1.4.0) - 2022-08-15

### Added
* [Add discover queries](https://github.com/SolidBench/SolidBench.js/commit/a6452ba9f027d2cb1ede3c6ded2353c5bd33495e)

<a name="v1.3.1"></a>
## [v1.3.1](https://github.com/SolidBench/SolidBench.js/compare/v1.3.0...v1.3.1) - 2022-08-10

### Fixed
* [Fix fragmenter issues with forum backlinks](https://github.com/SolidBench/SolidBench.js/commit/607d2e34701362360f73cdc9c9f2798d8f470be5)

<a name="v1.3.0"></a>
## [v1.3.0](https://github.com/SolidBench/SolidBench.js/compare/v1.2.1...v1.3.0) - 2022-08-02

### Added
* [Append reverse links from forums to posts](https://github.com/SolidBench/SolidBench.js/commit/b13818b9dbdb6f583ff514d80fa19d46e479fd93)

<a name="v1.2.1"></a>
## [v1.2.1](https://github.com/SolidBench/SolidBench.js/compare/v1.2.0...v1.2.1) - 2022-07-26

### Fixed
* [Pull Docker image if it is not available](https://github.com/SolidBench/SolidBench.js/commit/32d957aef43518820f7c35f16bff3223e1606ea6)

<a name="v1.2.0"></a>
## [v1.2.0](https://github.com/SolidBench/SolidBench.js/compare/v1.1.1...v1.2.0) - 2022-07-18

### Changed
* [Rename project to SolidBench.js](https://github.com/SolidBench/SolidBench.js/commit/c803f40e617f208fdf537f795d5ecc759f0db7cf)
* [Update to ldbc-snb-enhancer 2.2.0](https://github.com/SolidBench/SolidBench.js/commit/af76b4815367834b1f60c047bb93afc0e9f0310d)

### Fixed
* [Fix different cwd not being applied on config runners](https://github.com/SolidBench/SolidBench.js/commit/7cde2001c2bfefe998d42a4f209858be0effa71a)

<a name="v1.1.1"></a>
## [v1.1.1](https://github.com/SolidBench/SolidBench.js/compare/v1.1.0...v1.1.1) - 2022-06-13

### Fixed
* [Fix complex queries not correctly being instantiated](https://github.com/SolidBench/SolidBench.js/commit/27e0bf41fddc2792e2675cb81f86884d490fc238)

<a name="v1.1.0"></a>
## [v1.1.0](https://github.com/SolidBench/SolidBench.js/compare/v1.0.1...v1.1.0) - 2022-06-02

### Fixed
* [Fix incorrect query parameter path](https://github.com/SolidBench/SolidBench.js/commit/f2cdd5a632e27b19539d6d521496f1765a52120d)
* [Fix no such file errors during generation outside of repo, Closes #2](https://github.com/SolidBench/SolidBench.js/commit/030c59ffbb6a720c0376a83b3a6738f329805a5f)

### Added
* [Add validation queries and results generation](https://github.com/SolidBench/SolidBench.js/commit/1ec85564a90d2866d35f4987efbf7f904cf7d717)
* [Add all ldbc snb interactive queries as templates](https://github.com/SolidBench/SolidBench.js/commit/b0f8e70dbede6d0543a681dcbe247fcdfa969556)
* [Configure all interactive-complex queries by default](https://github.com/SolidBench/SolidBench.js/commit/46b4f74fcac78dc598548f7d8c535dcdd9a07e4c)
* [Configure all interactive-short queries by default](https://github.com/SolidBench/SolidBench.js/commit/3fe13cb679a6decd0ffdc2430eba1d646a5788e7)
* [Produce noise data per pod](https://github.com/SolidBench/SolidBench.js/commit/ae0de7bc31f000287fc2418d14fb590deddaefd1)


### Changed
* [Make message-based queries parameterized by both comments and posts](https://github.com/SolidBench/SolidBench.js/commit/7a5f04f4bb255cc12e4f34239e3e9235cb42515c)
* [Update to CSS 5](https://github.com/SolidBench/SolidBench.js/commit/a3d0b8b4b80cb77df0ccc13ec3922942cf8da8cb)
* [Introduce more variance in Solid pod fragmentation](https://github.com/SolidBench/SolidBench.js/commit/71c0e1d179d66ff9f1d4e7101a47d71d35af9a71)
* [Fragment resources into pod-like structures by default](https://github.com/SolidBench/SolidBench.js/commit/56ee31dcc3bec1255e3e47ce150618ccb35297ce)

<a name="v1.0.1"></a>
## [v1.0.1](https://github.com/SolidBench/SolidBench.js/compare/v1.0.0...v1.0.1) - 2021-05-26

### Fixed
* [Expose Templates.QUERIES_DIRECTORY](https://github.com/SolidBench/SolidBench.js/commit/712a1f5b667ffea239ace5415bc5b3a68329a5e1)

<a name="v1.0.0"></a>
## [v1.0.0] - 2021-05-05

Initial release
