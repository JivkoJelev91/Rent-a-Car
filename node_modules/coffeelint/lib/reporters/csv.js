(function() {
  var CSVReporter;

  module.exports = CSVReporter = class CSVReporter {
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
      var e, errors, f, header, path, ref, results;
      header = ['path', 'lineNumber', 'lineNumberEnd', 'level', 'message'];
      this.print(header.join(','));
      ref = this.errorReport.paths;
      results = [];
      for (path in ref) {
        errors = ref[path];
        results.push((function() {
          var i, len, ref1, results1;
          results1 = [];
          for (i = 0, len = errors.length; i < len; i++) {
            e = errors[i];
            if (!(!this.quiet || e.level === 'error')) {
              continue;
            }
            if (e.context) {
              // Having the context is useful for the cyclomatic_complexity
              // rule and critical for the undefined_variables rule.
              e.message += ` ${e.context}.`;
            }
            f = [path, e.lineNumber, (ref1 = e.lineNumberEnd) != null ? ref1 : e.lineNumberEnd, e.level, e.message];
            results1.push(this.print(f.join(',')));
          }
          return results1;
        }).call(this));
      }
      return results;
    }

  };

}).call(this);
