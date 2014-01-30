void function(){
  var deferred = require('deferred')
  var gm = require('gm')
  var path = require('path')

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

  function size(img, edges){
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

  var limited_size = deferred.gate(size, 1)

  module.exports = function generateBackground(backgroundData){
    var img = gm(backgroundData.srcPath).limit('memory', '32MB')
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
      console.log(backgroundData.outPath)
      saveTo(backgroundData.outPath)(img)
      return { classname: path.basename(backgroundData.srcPath, path.extname(backgroundData.srcPath))
             , maxWidth: maxWidth
             //, edges: edges
             }
    })
  }
}()
