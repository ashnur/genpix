void function(){
  var fs = require('fs')
  var path = require('path')
  var dot = require('dot')
  var deferred = require('deferred')
  var writeFile = deferred.promisify(fs.writeFile)
  module.exports = function writeCSS(destination, queries){
    var csstpl = fs.readFileSync(path.join(__dirname, 'css_media_query.tpl'), 'utf8')
    var cssFile = dot.compile(csstpl)
    var cssObj = queries.reduce(function(cssObj, query){
      if ( !cssObj[query.maxWidth] ) cssObj[query.maxWidth] = []
      cssObj[query.maxWidth].push(query.classname)
      return cssObj
    }, {})
    return Object.keys(cssObj).map(function(maxWidth){
      var cssOutPath = destination('media_queries.css', maxWidth)
      // console.log(cssFile({files: cssObj[maxWidth], maxWidth: maxWidth, halfOfMaxWidth: maxWidth/2}))
      return writeFile(cssOutPath, cssFile({files: cssObj[maxWidth], maxWidth: maxWidth, halfOfMaxWidth: maxWidth/2}))
    })
  }
}()
