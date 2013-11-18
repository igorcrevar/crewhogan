var assert = require("assert");


var data = {
    users: [
        { name: "mirko", languages: [ "serbian", "english" ] },
        { name: "slavko", languages: [ "russian" ] }
    ],
    footer: "Hello from inner space!"
};
var resultShouldBe = "@mirko: serbian, english,    @slavko: russian,     Hello from inner space!"

function exceptionOccured(func) {
    try {
        func();
        return false;
    }
    catch (e) {
        return true;
    }
}

var expressApp = {
    func: [],
    use: true,
    set: true,
    get: function(val) {
        if (val == 'view engine') return 'hogan';
        else return __dirname + "/templates";
    },
    engine: function(name, renderFunc) {
        this.func[name] = renderFunc;
    }
};

describe('template.js', function() {
    describe('#render', function() {
        it('render templates with normal approach, render main.hogan', function() {
            var crewhoganObj = require('./../lib/template.js')(false, __dirname + '/templates');
            var output = crewhoganObj.render('main.hogan', data);
            assert.equal(output, resultShouldBe);
        });

        it('render templates with normal approach, render user partial', function() {
            var crewhoganObj = require('./../lib/template.js')(false, __dirname + '/templates');
            var output = crewhoganObj.render('partials/user.hogan', data.users[0]);
            assert.equal(output, "@mirko: serbian, english,    ");
        });

        it('render templates express style', function() {
            require('./../lib/template.js')(expressApp); 
            expressApp.func[expressApp.get('view engine')](expressApp.get('views') + "/main.hogan", data, function(error, output) {
                assert.equal(output, resultShouldBe);
            });            
        });

        it('render unexist template - should throw exception', function() {
            var crewhoganObj = require('./../lib/template.js')(false, __dirname + '/' + 'templates');
            var result = exceptionOccured(function() { crewhoganObj.render('main.hogane', data) });
            assert.equal(result, true);
        });

        it('test templates with path aliases', function() {
            var crewhoganObj = require('./../lib/template.js')(false, {
                aliases: {
                    templates_alias: __dirname + '/templates',
                    partials_alias: __dirname + '/templates/partials'
                },
            });
            var output = crewhoganObj.render('templates_alias::main_alias.hogan', data);
            assert.equal(output, "text: Hello from inner space!");
        });

        it('test path aliases, alias not specified, exception should be thrown', function() {
            var crewhoganObj = require('./../lib/template.js')(false, {
                aliases: {
                    templates_alias: __dirname + '/templates'
                },
                baseDir: __dirname + '/templates'
            });
            var result = exceptionOccured(function() { crewhoganObj.render('templates_alias::main_alias2.hogan', data) });
            assert.equal(result, true);
        });

        it('test templates with path aliases, mixed', function() {
            var crewhoganObj = require('./../lib/template.js')(false, {
                aliases: {
                    templates_alias: __dirname + '/templates',
                    partials_alias: __dirname + '/templates/partials'
                },
                baseDir: __dirname + '/templates'
            });
            var output = crewhoganObj.render('main_alias2.hogan', data);
            assert.equal(output, "footers: Hello from inner space! Hello from inner space!");       
        });
    });
});


describe('engine.js', function() {
    describe('#render', function() {
        it('does cache works?', function() {
            var obj = require('./../lib/engine.js')(__dirname + '/' + 'templates', true);
            assert.equal(obj.getCachedItemsCount(), 0);
            var output = obj.render('main.hogan', data);
            assert.equal(obj.getCachedItemsCount(), 4);
            assert.equal(obj.numberOfCachedTemplatesInLastRender, 4);

            var output = obj.render('main.hogan', data);
            assert.equal(obj.getCachedItemsCount(), 4);
            assert.equal(obj.numberOfCachedTemplatesInLastRender, 0);

            obj.clearCached();
            assert.equal(obj.getCachedItemsCount(), 0);
        });

        it('does cache works? second check', function() {
            var obj = require('./../lib/engine.js')(__dirname + '/' + 'templates', true);
            
            var output = obj.render('partials/user.hogan', data.users[0]);
            assert.equal(output, "@mirko: serbian, english,    ");
            assert.equal(obj.getCachedItemsCount(), 2);

            var output = obj.render('partials/footer.hogan', { footer: "footer" });
            assert.equal(output, "footer");
            assert.equal(obj.getCachedItemsCount(), 3);
            assert.equal(obj.numberOfCachedTemplatesInLastRender, 1);

            var output = obj.render('main.hogan', data);
            assert.equal(obj.getCachedItemsCount(), 4);
            assert.equal(obj.numberOfCachedTemplatesInLastRender, 1);
        });
    });
});