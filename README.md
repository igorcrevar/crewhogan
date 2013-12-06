crewhogan
=========

Hogan.js for nodejs and expressjs 3.x. Caches compiled templates and auto resolve all partials.

Fully tested. Run ````` mocha --reporter spec ````` in root to execute tests.

New: It's possible to use aliases for (predefined) template paths. This feature only works if
crewhogan is not used "express way" (partials will work with aliases in both cases, but res.send is problem because express checks if file exists)

Template name must contains only characters in this pattern /([a-zA-Z0-9_\-.]+)/

Options for crewhogan object:
- baseDir // base directory for templates, can be ommited if using aliases
- aliases // collection of key value pairs where key is alias name and value is directory path for that alias
- aliasSeparator // separator for aliases, defaults to ::
- templateExtension // default template extension, defaults to '.hogan'

### One can use library in 2 different ways:

- express way:
```js
var app = express();
// the order of lines bellow is important!!!
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
require('crewhogan')(app); // register crew hogan engine
...
// there is template file inside __dirname/templates/main/index.html
res.render('main/index', data); // dont know what data is? look at hogan.js/mustache documentation :)   
```

- other way:
```js 
var crewhoganObj = require('crewhogan')(false, {
    baseDir: __dirname + '/templates',
});
...
// resolves template inside __dirname/templates/main/index.hogan
var html = crewhoganObj.render('main/index', data);
res.send(html)
...
// and in __dirname/templates/main/index.hogan
{{> main/partials/some_partial }}
// will load partial __dirname/templates/main/partials/some_partial.hogan
```

- with aliases and custom extension (.html instead .hogan)
```js
var crewhoganObj = require('crewhogan')(false, {
    aliases: {
        templates_alias: __dirname + '/templates/',
        partials_alias: __dirname + '/templates/main/partials'
    },
    // optional, for resolving "non aliased" template names
    baseDir: "default_path_for_templates",
	templateExtension: '.html'
});
...
var html = crewhoganObj.render('templates_alias::main/index', data);
// will render data from __dirname/templates/main/index.html
...
// and in __dirname/templates/main/index.html
{{> partials_alias::some_partial }}
// will load partial __dirname/templates/main/partials/some_partial.html
```
