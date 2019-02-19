(function() {
  var RawReporter;

  module.exports = RawReporter = class RawReporter {
    constructor(errorReport, options = {}) {
      this.errorReport = errorReport;
      ({quiet: this.quiet} = options);
    }

    print(message) {
      // coffeelint: disable=no_debugger
      return console.log(message);
    }

    // coffeelint: enable=no_debugger
    publish() {
      var e, er, errors, path, ref;
      er = {};
      ref = this.errorReport.paths;
      for (path in ref) {
        errors = ref[path];
        er[path] = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = errors.length; i < len; i++) {
            e = errors[i];
            if (!this.quiet || e.level === 'error') {
              results.push(e);
            }
          }
          return results;
        }).call(this);
      }
      return this.print(JSON.stringify(er, void 0, 2));
    }

  };

}).call(this);
