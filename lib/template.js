var engineFunc = require('./engine');

/**
 * Exports function
 * @param {Object} instance of expressjs app or (null|undefined|false)
 * @param {Object|String} @see engine.js
 * @return if first parameter is expressjs app object return undefined else @see engine.js
 * @author: Igor Crevar
 */
module.exports = function(app, options) {
   // its express app
   if (app && app.engine && app.get) {
      var expressViewsPath = app.get('views');
      var expressEngineName = app.get('view engine');
      options = options || {};
      if (!expressViewsPath) {
         throw "CrewHogan express views does not set!";
      }
      else {
         options.baseDir = expressViewsPath;
      }

      options.templateExtension = expressEngineName;
      var crewhoganObj = engineFunc(options);
      app.engine(expressEngineName, function(path, options, fn) {
         path = path.substring(expressViewsPath.length + 1);
         var output = crewhoganObj.render(path, options);
         fn(null, output);
      });
   }
   else {
      var crewhoganObj = engineFunc(options);
      return crewhoganObj;
   }
}