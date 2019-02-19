(function() {
  /*
  CoffeeLint

  Copyright (c) 2011 Matthew Perpick.
  CoffeeLint is freely distributable under the MIT license.
  */
  var Cache, CoffeeScript, coffeelint, config, configfinder, coreReporters, data, deprecatedReporter, errorReport, findCoffeeScripts, fs, getAllExtention, getFallbackConfig, glob, ignore, jsonIndentation, lintFiles, lintSource, loadConfig, log, logConfig, optimist, options, os, path, paths, read, readConfigFile, ref, reportAndExit, resolve, ruleLoader, scripts, stdin, stripComments, thisdir, userConfig;

  resolve = require('resolve').sync;

  path = require('path');

  fs = require('fs');

  os = require('os');

  glob = require('glob');

  optimist = require('optimist');

  ignore = require('ignore');

  stripComments = require('strip-json-comments');

  thisdir = path.dirname(fs.realpathSync(__filename));

  coffeelint = require(path.join(thisdir, 'coffeelint'));

  configfinder = require(path.join(thisdir, 'configfinder'));

  ruleLoader = require(path.join(thisdir, 'ruleLoader'));

  Cache = require(path.join(thisdir, 'cache'));

  CoffeeScript = require('coffeescript');

  CoffeeScript.register();

  log = function() {
    // coffeelint: disable=no_debugger
    return console.log(...arguments);
  };

  // coffeelint: enable=no_debugger
  jsonIndentation = 2;

  logConfig = function(config) {
    var filter;
    filter = function(k, v) {
      if (k !== 'message' && k !== 'description' && k !== 'name') {
        return v;
      }
    };
    return log(JSON.stringify(config, filter, jsonIndentation));
  };

  // Return the contents of the given file synchronously.
  read = function(path) {
    var realPath;
    realPath = fs.realpathSync(path);
    return fs.readFileSync(realPath).toString();
  };

  // build all extentions to search
  getAllExtention = function(extension) {
    if (extension != null) {
      extension = ['coffee'].concat(extension != null ? extension.split(',') : void 0);
      return `@(${extension.join('|')})`;
    } else {
      return 'coffee';
    }
  };

  // Return a list of CoffeeScript's in the given paths.
  findCoffeeScripts = function(paths, extension) {
    var allExtention, files, i, len, opts, p;
    files = [];
    allExtention = getAllExtention(extension);
    opts = {
      ignore: 'node_modules/**'
    };
    for (i = 0, len = paths.length; i < len; i++) {
      p = paths[i];
      if (fs.statSync(p).isDirectory()) {
        // The glob library only uses forward slashes.
        files = files.concat(glob.sync(`${p}/**/*.${allExtention}`, opts));
      } else {
        files.push(p);
      }
    }
    // Normalize paths, converting './test/fixtures' to 'test/fixtures'.
    // Ignore pattern 'test/fixtures' does NOT match './test/fixtures',
    // because if there is a slash(/) in the pattern, the pattern will not
    // act as a glob pattern.
    // Use `path.join()` instead of `path.normalize()` for better compatibility.
    return files.map(function(p) {
      return path.join(p);
    });
  };

  // Return an error report from linting the given paths.
  lintFiles = function(files, config) {
    var errorReport, file, fileConfig, i, len, literate, source;
    errorReport = new coffeelint.getErrorReport();
    for (i = 0, len = files.length; i < len; i++) {
      file = files[i];
      source = read(file);
      literate = CoffeeScript.helpers.isLiterate(file);
      fileConfig = config ? config : getFallbackConfig(file);
      errorReport.lint(file, source, fileConfig, literate);
    }
    return errorReport;
  };

  // Return an error report from linting the given coffeescript source.
  lintSource = function(source, config, literate = false) {
    var errorReport;
    errorReport = new coffeelint.getErrorReport();
    config || (config = getFallbackConfig());
    errorReport.lint('stdin', source, config, literate);
    return errorReport;
  };

  // Load a config file given a path/filename
  readConfigFile = function(path) {
    var text;
    text = read(path);
    try {
      jsonIndentation = text.split('\n')[1].match(/^\s+/)[0].length;
    } catch (error) {}
    return JSON.parse(stripComments(text));
  };

  loadConfig = function(options) {
    var config;
    config = null;
    if (!options.argv.noconfig) {
      if (options.argv.f) {
        config = readConfigFile(options.argv.f);
        // If -f was specifying a package.json, extract the config
        if (config.coffeelintConfig) {
          config = config.coffeelintConfig;
        }
      }
    }
    return config;
  };

  // Get fallback configuration. With the -F flag found configs in standard places
  // will be used for each file being linted. Standard places are package.json or
  // coffeelint.json in a project's root folder or the user's home folder.
  getFallbackConfig = function(filename = null) {
    if (!options.argv.noconfig) {
      return configfinder.getConfig(filename);
    }
  };

  // These reporters are usually parsed by other software, so I can't just echo a
  // warning.  Creating a fake file is my best attempt.
  deprecatedReporter = function(errorReport, reporter) {
    var base;
    if ((base = errorReport.paths)['coffeelint_fake_file.coffee'] == null) {
      base['coffeelint_fake_file.coffee'] = [];
    }
    errorReport.paths['coffeelint_fake_file.coffee'].push({
      'level': 'warn',
      'rule': 'commandline',
      'message': `parameter --${reporter} is deprecated. Use --reporter ${reporter} instead`,
      'lineNumber': 0
    });
    return reporter;
  };

  coreReporters = {
    default: require(path.join(thisdir, 'reporters', 'default')),
    csv: require(path.join(thisdir, 'reporters', 'csv')),
    jslint: require(path.join(thisdir, 'reporters', 'jslint')),
    checkstyle: require(path.join(thisdir, 'reporters', 'checkstyle')),
    raw: require(path.join(thisdir, 'reporters', 'raw'))
  };

  // Publish the error report and exit with the appropriate status.
  reportAndExit = function(errorReport, options) {
    var SelectedReporter, base, colorize, ref, reporter, strReporter;
    strReporter = options.argv.jslint ? deprecatedReporter(errorReport, 'jslint') : options.argv.csv ? deprecatedReporter(errorReport, 'csv') : options.argv.checkstyle ? deprecatedReporter(errorReport, 'checkstyle') : options.argv.reporter;
    if (strReporter == null) {
      strReporter = 'default';
    }
    SelectedReporter = (ref = coreReporters[strReporter]) != null ? ref : (function() {
      var reporterPath;
      try {
        reporterPath = resolve(strReporter, {
          basedir: process.cwd(),
          extensions: ['.js', '.coffee', '.litcoffee', '.coffee.md']
        });
      } catch (error) {
        reporterPath = strReporter;
      }
      return require(reporterPath);
    })();
    if ((base = options.argv).color == null) {
      base.color = options.argv.nocolor ? 'never' : 'auto';
    }
    colorize = (function() {
      switch (options.argv.color) {
        case 'always':
          return true;
        case 'never':
          return false;
        default:
          return process.stdout.isTTY;
      }
    })();
    reporter = new SelectedReporter(errorReport, {
      colorize: colorize,
      quiet: options.argv.q
    });
    reporter.publish();
    return process.on('exit', function() {
      return process.exit(errorReport.getExitCode());
    });
  };

  // Declare command line options.
  options = optimist.usage('Usage: coffeelint [options] source [...]').alias('f', 'file').alias('h', 'help').alias('v', 'version').alias('s', 'stdin').alias('q', 'quiet').alias('c', 'cache').describe('f', 'Specify a custom configuration file.').describe('rules', 'Specify a custom rule or directory of rules.').describe('makeconfig', 'Prints a default config file').describe('trimconfig', 'Compares your config with the default and prints a minimal configuration').describe('noconfig', 'Ignores any config file.').describe('h', 'Print help information.').describe('v', 'Print current version number.').describe('r', '(not used, but left for backward compatibility)').describe('reporter', 'built in reporter (default, csv, jslint, checkstyle, raw), or module, or path to reporter file.').describe('csv', '[deprecated] use --reporter csv').describe('jslint', '[deprecated] use --reporter jslint').describe('nocolor', '[deprecated] use --color=never').describe('checkstyle', '[deprecated] use --reporter checkstyle').describe('color=<when>', 'When to colorize the output. <when> can be one of always, never , or auto.').describe('s', 'Lint the source from stdin').describe('q', 'Only print errors.').describe('literate', 'Used with --stdin to process as Literate CoffeeScript').describe('c', 'Cache linting results').describe('ext', 'Specify an additional file extension, separated by comma.').boolean('csv').boolean('jslint').boolean('checkstyle').boolean('nocolor').boolean('noconfig').boolean('makeconfig').boolean('trimconfig').boolean('literate').boolean('r').boolean('s').boolean('q', 'Print errors only.').boolean('c');

  if (options.argv.v) {
    log(coffeelint.VERSION);
    process.exit(0);
  } else if (options.argv.h) {
    options.showHelp();
    process.exit(0);
  } else if (options.argv.trimconfig) {
    userConfig = (ref = loadConfig(options)) != null ? ref : getFallbackConfig();
    logConfig(coffeelint.trimConfig(userConfig));
  } else if (options.argv.makeconfig) {
    logConfig(coffeelint.getRules());
  } else if (options.argv._.length < 1 && !options.argv.s) {
    options.showHelp();
    process.exit(1);
  } else {
    // Initialize cache, if enabled
    if (options.argv.cache) {
      coffeelint.setCache(new Cache(path.join(os.tmpdir(), 'coffeelint')));
    }
    // Load configuration.
    config = loadConfig(options);
    if (options.argv.rules) {
      ruleLoader.loadRule(coffeelint, options.argv.rules);
    }
    if (options.argv.s) {
      // Lint from stdin
      data = '';
      stdin = process.openStdin();
      stdin.on('data', function(buffer) {
        if (buffer) {
          return data += buffer.toString();
        }
      });
      stdin.on('end', function() {
        var errorReport;
        errorReport = lintSource(data, config, options.argv.literate);
        return reportAndExit(errorReport, options);
      });
    } else {
      // Find scripts to lint.
      paths = options.argv._;
      scripts = findCoffeeScripts(paths, options.argv.ext);
      if (fs.existsSync('.coffeelintignore')) {
        scripts = ignore().add(fs.readFileSync('.coffeelintignore').toString()).filter(scripts);
      }
      // Lint the code.
      errorReport = lintFiles(scripts, config, options.argv.literate);
      reportAndExit(errorReport, options);
    }
  }

}).call(this);
