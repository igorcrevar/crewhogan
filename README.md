crewhogan
=========

Hogan.js for nodejs and expressjs 3.x. Caches compiled templates and auto resolve all partials.

Fully tested. ````` Run mocha --reporter spec ````` in root to execute tests.

### One can use library in 2 different ways:
- express like:
`````javascript
    var app = express();
	// the order of lines bellow is important!!!
	app.set('views', __dirname + '/templates');
    app.set('view engine', 'html');
	require('crewhogan')(app); // register crew hogan engine
	...
	// there is template file inside templates/main/index.html
	res.render('main/login', data); // dont know what data is? look at hogan.js/mustache documentation :)	
`````
- other way (more flexibile)
`````javascript
	var crewhoganObj = require('crewhogan')(false, __dirname + '/templates');
    ...
	var html = crewhoganObj.render('main/index.html', data);
    res.send(html)
`````