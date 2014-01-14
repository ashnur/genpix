#!/usr/bin/env node
var args = require('optimist')
            .usage('Usage: $0 -d [path to dimensions file] -o [path to output dir]')
            .demand(['d', 'o'])
            .argv
var fs = require('fs')
var yml = require('js-yaml')
var dimensions = yml.safeLoad(fs.readFileSync(args.d, 'utf8'))

var genpix = require('../index.js')

genpix(args.o, dimensions)
