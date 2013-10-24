var engineFunc = require('./engine');

/**
 * Exports function
 * @param {Object} instance of expressjs app or (null|undefined|false)
 * @param {String} base directory for templates, not mandatory, by default its undefined
 * @return if first parameter is expressjs app object return undefined else @see engine.js
 */
module.exports = function(app, baseDir) {
   // its express app
   if (app && app.use && app.set && app.get) {
      var expressViewsPath = app.get('views');
      var expressEngineName = app.get('view engine');
      if (!expressViewsPath) {
         throw "CrewHogan express views does not set!";
      }

      var crewhoganObj = engineFunc(expressViewsPath);
      app.engine(expressEngineName, function(path, options, fn) {
         path = path.substring(expressViewsPath.length + 1);
         var output = crewhoganObj.render(path, options);
         fn(null, output);
      });
   }
   else {
      var crewhoganObj = engineFunc(baseDir);
      return crewhoganObj;
   }
}