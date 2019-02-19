(function() {
  var CheckstyleReporter, JsLintReporter;

  JsLintReporter = require('./jslint');

  module.exports = CheckstyleReporter = (function() {
    class CheckstyleReporter {
      constructor(errorReport, options = {}) {
        this.errorReport = errorReport;
        ({quiet: this.quiet} = options);
      }

      print(message) {
        // coffeelint: disable=no_debugger
        return console.log(message);
      }

      publish() {
        var context, e, errors, i, len, level, path, ref, ref1;
        this.print('<?xml version="1.0" encoding="utf-8"?>');
        this.print('<checkstyle version="4.3">');
        ref = this.errorReport.paths;
        for (path in ref) {
          errors = ref[path];
          if (errors.length) {
            this.print(`<file name="${path}">`);
            for (i = 0, len = errors.length; i < len; i++) {
              e = errors[i];
              if (!(!this.quiet || e.level === 'error')) {
                continue;
              }
              level = e.level;
              if (level === 'warn') {
                level = 'warning';
              }
              // context is optional, this avoids generating the string
              // "context: undefined"
              context = (ref1 = e.context) != null ? ref1 : '';
              this.print(`<error line="${e.lineNumber}"\n    severity="${this.escape(level)}"\n    message="${this.escape(e.message + '; context: ' + context)}"\n    source="coffeelint"/>`);
            }
            this.print('</file>');
          }
        }
        return this.print('</checkstyle>');
      }

    };

    // coffeelint: enable=no_debugger
    CheckstyleReporter.prototype.escape = JsLintReporter.prototype.escape;

    return CheckstyleReporter;

  }).call(this);

}).call(this);
