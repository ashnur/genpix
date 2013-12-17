void function(){
  var args = require('optimist')
              .usage('Usage: $0 -d [path to dimensions file] -o [path to output dir]')
              .demand(['d', 'o'])
              .argv
  var liberate = require('liberate')
  var fs = require('fs')
  var yml = require('js-yaml')
  var dimensions = yml.safeLoad(fs.readFileSync(args.d, 'utf8'))
  var path = require('path')
  var deferred = require('deferred')
  var readFile = deferred.promisify(fs.readFile)
  var writeFile = deferred.promisify(fs.writeFile)
  var gm = require('gm')
  var dot = require('dot')

  function getOutPath(sourcePath, maxWidth){
    return destination(path.join(__dirname, args.o), path.basename(sourcePath), maxWidth)
  }

  function destination(dir, name, size){
    var ext = path.extname(name)
    return path.join(dir, path.basename(name, ext)+'_'+size+ext)
  }

  function getBgData(backgroundData, image){
    var sizes = Object.keys(image.sizes).map(function(maxWidth){
      return {
        srcPath: image.src
      , outPath: getOutPath(image.src, maxWidth)
      , edges: image.sizes[maxWidth]
      , maxWidth: maxWidth
      }
    })
    return backgroundData.concat(sizes)
  }

  function normalizeFile(file){
    return {
              src: path.join(__dirname, dimensions.source_dir, file )
           ,  sizes: dimensions.images[file]
           }
  }

  function normalizeDimensions(dimensions){
    return Object.keys(dimensions.images).map(normalizeFile).reduce(getBgData, [])
  }

  function size(img, edges){
    //console.log('size')
    var def = deferred()
    if ( edges ) {
      def.resolve({width: edges[2]-edges[1], height: edges[3]-edges[0]})
    } else {
      img.size(function(err, size){
        if ( err ) def.reject(err)
        def.resolve(size)
      })
    }
    return def.promise
  }

  function saveTo(outPath){
    return deferred.gate(function(img){
      var def = deferred()
      img.write(outPath, function(err){
        //console.log('write')
        if ( err ) throw err
        def.resolve()
      })
      return def.promise
    }, 1)
  }

  var limited_size = deferred.gate(size, 1)

  function over(){ console.log('done!') }

  // generateBackground :: BackgroundData -> Background
  function generateBackground(backgroundData){
    var img = gm(backgroundData.srcPath)
    var edges = backgroundData.edges
    var maxWidth = backgroundData.maxWidth
    return limited_size(img, edges)(function(dim){
      return ( edges && ( edges[0] > 0
                       || edges[1] > 0
                       || edges[2] < dim.width
                       || edges.bottom < dim.height )
             ) ? img.crop(dim.width, dim.height, edges[1]||0, edges[0]||0)
               : img
    })(function(img){
      return limited_size(img, null)(function(dim){
        return dim.width <= maxWidth ? img : img.resize(maxWidth)
      })
    })(function(img){
      //console.log(backgroundData.outPath)
      saveTo(backgroundData.outPath)(img)
      return { classname: path.basename(backgroundData.srcPath, path.extname(backgroundData.srcPath))
             , maxWidth: maxWidth
             //, edges: edges
             }
    })
  }

  function writeCSS(queries){
    var csstpl = fs.readFileSync(path.join(__dirname, 'css_media_query.tpl'), 'utf8')
    var cssFile = dot.compile(csstpl)
    var cssObj = queries.reduce(function(cssObj, query){
      if ( !cssObj[query.maxWidth] ) cssObj[query.maxWidth] = []
      cssObj[query.maxWidth].push(query.classname)
      return cssObj
    }, {})
    return Object.keys(cssObj).map(function(maxWidth){
      var cssOutPath = getOutPath('media_queries.css', maxWidth)
//      console.log(cssFile({files: cssObj[maxWidth], maxWidth: maxWidth, halfOfMaxWidth: maxWidth/2}))
      return writeFile(cssOutPath, cssFile({files: cssObj[maxWidth], maxWidth: maxWidth, halfOfMaxWidth: maxWidth/2}))
    })
  }

  deferred.apply(deferred, normalizeDimensions(dimensions).map(generateBackground))
          (writeCSS)
          .done(over)


}()
