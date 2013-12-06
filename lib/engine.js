/**
 * Exports function
 * @param {String|Object} not mandatory
 * 	   if String - base directory for templates
 * 	   if object than it should be list of options { baseDir: '', aliases: {}, aliasSeparator: '::', templateExtension: '.hogan' }
 * @param {boolean} is we are in debug mode or not
 * @return {Object} with functions bellow
 *   render: - renders template with name and data
 *     @name {String} name of template - for example main_login 
 *     @data {Object} data that will be used in templates
 *   clearCached - clears all cached templates
 * @author: Igor Crevar
 */
module.exports = function(options, debug) {
	var hogan = require('hogan.js');
	var fs = require('fs');
	var pathModule = require('path');
	
	//regex wich is used to pick module_templatename for lazy loading
	var regex = /([a-zA-Z0-9_\-.]+)/g;;
	// hold { template, partials }
	var cachedTemplates = {};
	var baseDir = '';
	var aliases = {};
	var aliasSeparator = '::';
	var templateExtension = '.hogan';
	if (options instanceof Object) {
		if (typeof(options.baseDir) == 'string') {
			baseDir = options.baseDir;	
		}
		
		if (options.aliases instanceof Object && options.aliases) {
			aliases = options.aliases;
		}

		if (options.aliasSeparator) {
			aliasSeparator = options.aliasSeparator;
		}

		if (options.templateExtension && options.templateExtension.length > 0) {
			templateExtension = options.templateExtension;
			if (templateExtension[0] != '.') {
				templateExtension = '.' + templateExtension;
			}
		}
	} else if (typeof(options) == 'string') { // backward compatibility
		baseDir = options; 
	}

	function getPartialNames(template) {
		// retrieve all {{> names}}
		return hogan.scan(template).filter(function (i) {
			return i.tag == '<' || i.tag == '>';
		}).map(function (i) {
			return i.n;
		});
	}

	function readFile(filePath) {
		try {
	        var data = fs.readFileSync(filePath, 'utf8');
		    return data;
	    } catch (e) {
	        throw 'CrewHogan can not load template : ' + filePath;
	    }
	}

	function getPathFromMatches(matches, templatePath) {
		var paths = [templatePath]
		matches.forEach(function(match) {
			paths.push(match);
		});

		var filePath = pathModule.join.apply(undefined, paths);
		return filePath;
	}

	function getTemplate(name, partials) {
		var cached = cachedTemplates[name];
		if (!cached) {
			// first check if aliases are using
			var alias;
			var index = name.indexOf(aliasSeparator);
			var templatePath = baseDir;
			var templateName = name;
			if (index != -1) {
				alias = name.substring(0, index);
				templateName = name.substring(index + aliasSeparator.length);
				templatePath = aliases[alias];
				if (!templatePath) {
					throw "CrewHogan alias does not exist: " + alias;
				}
			}

			// templat extension on the end
			if (templateName.length < templateExtension.length ||
          		templateName.lastIndexOf(templateExtension) != templateName.length - templateExtension.length) {
				templateName += templateExtension;
			}

			//lazy loading
			var matches = templateName.match(regex);
			if (matches) {
				var filePath = getPathFromMatches(matches, templatePath);
				var data = readFile(filePath);

				// compile template and store it to cached templates
				cachedTemplates[templateName] = cached = { template: hogan.compile(data), partials: {} };
				
				// prepare partials
				getPartialNames(data).forEach(function(partialName) {
					var compiledPartial = getTemplate(partialName);
					// update partials of current template
					cached.partials[partialName] = compiledPartial.template;
					// copy partial partials to parent
					for (var ppName in compiledPartial.partials) {
						var pp = compiledPartial.partials[ppName];
						cached.partials[ppName] = pp;
					}
				});						
			} else {
				throw "CrewHogan Template = " + name + " is invalid";
			}
		}

		return cached;
	}

	function render(name, data) {
		data = data || {};
		var cached = getTemplate(name);

		// for some reason hogan.js render change partials object!?!?!. So make shallow copy of it
		var tmp = {};
		for (var i in cached.partials) {
			tmp[i] = cached.partials[i];
		}

		return cached.template.render(data, tmp);
	}

	function clearCached() {
		cachedTemplates = {};
	}

	if (debug) {
		return {
			"getCache": function() { return cachedTemplates; },
			"getCachedItemsCount": function() {
				var count = 0;				
				for (key in cachedTemplates) {
        			if (cachedTemplates.hasOwnProperty(key)) count++;
    			}
    			return count;
			},
			"render": function(name, data) {
				var countOld = this.getCachedItemsCount();
				var data = render(name, data);
				this.numberOfCachedTemplatesInLastRender = this.getCachedItemsCount() - countOld;
				return data;
			},
			"clearCached": clearCached
		};
	}

	return {
		"render": render,
		"clearCached": clearCached
	};
}