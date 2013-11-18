crewhogan
=========

Hogan.js for nodejs and expressjs 3.x. Caches compiled templates and auto resolve all partials.

Fully tested. Run ````` mocha --reporter spec ````` in root to execute tests.

New: It's possible to use aliases for (predefined) template paths. This feature only works if
crewhogan is not used "express way" (partials will work with aliases in both cases, but res.send is problem because express checks if file exists)

### One can use library in 2 different ways:

- express way:
```js
var app = express();
// the order of lines bellow is important!!!
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
require('crewhogan')(app); // register crew hogan engine
...
// there is template file inside templates/main/index.html
res.render('main/index', data); // dont know what data is? look at hogan.js/mustache documentation :)   
```

- other way:
```js 
var crewhoganObj = require('crewhogan')(false, __dirname + '/templates');
...
var html = crewhoganObj.render('main/index.html', data);
res.send(html)
```

- with aliases
```js
var crewhoganObj = require('./../lib/template.js')(false, {
    aliases: {
        templates_alias: __dirname + '/templates',
        partials_alias: __dirname + '/templates/partials'
    },
    // optional, for resolving "non aliased" template names
    baseDir: "default_path_for_templates" 
});
...
var html = crewhoganObj.render('templates_alias::index.hogan', data);
// and in index.hogan
// will load __dirname + '/templates/partials/some_partial.hogan' partial
{{> partials_alias::some_partial.hogan }}
```
