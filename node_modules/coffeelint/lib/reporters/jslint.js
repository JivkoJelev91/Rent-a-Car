(function() {
  var JSLintReporter;

  module.exports = JSLintReporter = class JSLintReporter {
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
      var e, errors, i, len, path, ref, ref1;
      this.print('<?xml version="1.0" encoding="utf-8"?><jslint>');
      ref = this.errorReport.paths;
      for (path in ref) {
        errors = ref[path];
        if (errors.length) {
          this.print(`<file name="${path}">`);
          for (i = 0, len = errors.length; i < len; i++) {
            e = errors[i];
            if (!this.quiet || e.level === 'error') {
              // continue if @quiet and e.level isnt 'error'
              this.print(`<issue line="${e.lineNumber}"\n        lineEnd="${(ref1 = e.lineNumberEnd) != null ? ref1 : e.lineNumber}"\n        reason="[${this.escape(e.level)}] ${this.escape(e.message)}"\n        evidence="${this.escape(e.context)}"/>`);
            }
          }
          this.print('</file>');
        }
      }
      return this.print('</jslint>');
    }

    escape(msg) {
      var i, len, r, replacements;
      // Force msg to be a String
      msg = '' + msg;
      if (!msg) {
        return;
      }
      // Perhaps some other HTML Special Chars should be added here
      // But this are the XML Special Chars listed in Wikipedia
      replacements = [[/&/g, '&amp;'], [/"/g, '&quot;'], [/</g, '&lt;'], [/>/g, '&gt;'], [/'/g, '&apos;']];
      for (i = 0, len = replacements.length; i < len; i++) {
        r = replacements[i];
        msg = msg.replace(r[0], r[1]);
      }
      return msg;
    }

  };

}).call(this);
