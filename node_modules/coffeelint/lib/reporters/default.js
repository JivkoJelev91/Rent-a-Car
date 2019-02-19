(function() {
  // Reports errors to the command line.
  var Reporter;

  module.exports = Reporter = class Reporter {
    constructor(errorReport, options = {}) {
      this.errorReport = errorReport;
      ({colorize: this.colorize, quiet: this.quiet} = options);
      this.ok = '✓';
      this.warn = '⚡';
      this.err = '✗';
    }

    stylize(message, ...styles) {
      var map;
      if (!this.colorize) {
        return message;
      }
      map = {
        bold: [1, 22],
        yellow: [33, 39],
        green: [32, 39],
        red: [31, 39]
      };
      return styles.reduce(function(m, s) {
        return '\u001b[' + map[s][0] + 'm' + m + '\u001b[' + map[s][1] + 'm';
      }, message);
    }

    publish() {
      var errors, path, paths, report;
      paths = this.errorReport.paths;
      report = '';
      for (path in paths) {
        errors = paths[path];
        report += this.reportPath(path, errors);
      }
      report += this.reportSummary(this.errorReport.getSummary());
      report += '';
      if (!this.quiet || this.errorReport.hasError()) {
        this.print(report);
      }
      return this;
    }

    reportSummary(s) {
      var e, err, file, msg, p, start, w, warn;
      start = s.errorCount > 0 ? `${this.err} ${this.stylize('Lint!', 'red', 'bold')}` : s.warningCount > 0 ? `${this.warn} ${this.stylize('Warning!', 'yellow', 'bold')}` : `${this.ok} ${this.stylize('Ok!', 'green', 'bold')}`;
      e = s.errorCount;
      w = s.warningCount;
      p = s.pathCount;
      err = this.plural('error', e);
      warn = this.plural('warning', w);
      file = this.plural('file', p);
      msg = `${start} » ${e} ${err} and ${w} ${warn} in ${p} ${file}`;
      return '\n' + this.stylize(msg) + '\n';
    }

    reportPath(path, errors) {
      var color, e, hasError, hasWarning, i, len, lineEnd, o, output, overall, pathReport;
      [overall, color] = (hasError = this.errorReport.pathHasError(path)) ? [this.err, 'red'] : (hasWarning = this.errorReport.pathHasWarning(path)) ? [this.warn, 'yellow'] : [this.ok, 'green'];
      pathReport = '';
      if (!this.quiet || hasError) {
        pathReport += `  ${overall} ${this.stylize(path, color, 'bold')}\n`;
      }
      for (i = 0, len = errors.length; i < len; i++) {
        e = errors[i];
        if (!(!this.quiet || e.level === 'error')) {
          continue;
        }
        o = e.level === 'error' ? this.err : this.warn;
        lineEnd = '';
        if (e.lineNumberEnd != null) {
          lineEnd = `-${e.lineNumberEnd}`;
        }
        output = '#' + e.lineNumber + lineEnd;
        pathReport += '     ' + `${o} ${this.stylize(output, color)}: ${e.message}.`;
        if (e.context) {
          pathReport += ` ${e.context}.`;
        }
        pathReport += '\n';
      }
      return pathReport;
    }

    print(message) {
      // coffeelint: disable=no_debugger
      return console.log(message);
    }

    // coffeelint: enable=no_debugger
    plural(str, count) {
      if (count === 1) {
        return str;
      } else {
        return `${str}s`;
      }
    }

  };

}).call(this);
