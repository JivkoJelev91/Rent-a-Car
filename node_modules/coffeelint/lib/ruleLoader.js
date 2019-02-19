(function() {
  var path, resolve;

  path = require('path');

  resolve = require('resolve').sync;

  // moduleName is a NodeJS module, or a path to a module NodeJS can load.
  module.exports = {
    require: function(moduleName) {
      var rulePath;
      try {
        // Try to find the project-level rule first.
        rulePath = resolve(moduleName, {
          basedir: process.cwd(),
          extensions: ['.js', '.coffee', '.litcoffee', '.coffee.md']
        });
        return require(rulePath);
      } catch (error) {}
      try {
        // Globally installed rule
        return require(moduleName);
      } catch (error) {}
      try {
        // Maybe the user used a relative path from the command line. This
        // doesn't make much sense from a config file, but seems natural
        // with the --rules option.

        // No try around this one, an exception here should abort the rest of
        // this function.
        return require(path.resolve(process.cwd(), moduleName));
      } catch (error) {}
      // This was already tried once. It will definitely fail, but it will
      // fail with a more sensible error message than the last require()
      // above.
      return require(moduleName);
    },
    loadFromConfig: function(coffeelint, config) {
      var data, results, ruleName;
      results = [];
      for (ruleName in config) {
        data = config[ruleName];
        if ((data != null ? data.module : void 0) != null) {
          results.push(this.loadRule(coffeelint, data.module, ruleName));
        }
      }
      return results;
    },
    // moduleName is a NodeJS module, or a path to a module NodeJS can load.
    loadRule: function(coffeelint, moduleName, ruleName = void 0) {
      var e, i, len, results, rule, ruleModule;
      try {
        ruleModule = this.require(moduleName);
        // Most rules can export as a single constructor function
        if (typeof ruleModule === 'function') {
          return coffeelint.registerRule(ruleModule, ruleName);
        } else {
// Or it can export an array of rules to load.
          results = [];
          for (i = 0, len = ruleModule.length; i < len; i++) {
            rule = ruleModule[i];
            results.push(coffeelint.registerRule(rule));
          }
          return results;
        }
      } catch (error) {
        e = error;
        // coffeelint: disable=no_debugger
        console.error(`Error loading ${moduleName}`);
        throw e;
      }
    }
  };

  // coffeelint: enable=no_debugger

}).call(this);
