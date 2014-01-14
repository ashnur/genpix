void function(){
  var path = require('path')
  var deferred = require('deferred')

  function destination(dir, name, size){
    var ext = path.extname(name)
    return path.join(dir, path.basename(name, ext)+'_'+size+ext)
  }

  function getBgData(outdir, backgroundData, image){
    return backgroundData.concat(Object.keys(image.sizes)
                                       .map(function(maxWidth){
      return {
        srcPath: image.src
      , outPath: destination(outdir, path.basename(image.src), maxWidth)
      , edges: image.sizes[maxWidth]
      , maxWidth: maxWidth
      }
    }))
  }

  function normalizeFile(dimensions, file){
    return {
              src: path.join(dimensions.source_dir, file )
           ,  sizes: dimensions.images[file]
           }
  }

  function normalizeDimensions(outdir, dimensions){
    return Object.keys(dimensions.images).map(normalizeFile.bind(null, dimensions)).reduce(getBgData.bind(null, outdir), [])
  }

  function over(){ console.log('done!') }

  module.exports = function(outdir, dimensions){
    return deferred.apply(deferred, normalizeDimensions(outdir, dimensions).map(require('./generateBg.js')))
            (require('./writeCSS.js').bind(null, destination.bind(null, outdir)))
            .done(over)
  }


}()
