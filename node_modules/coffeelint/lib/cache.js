(function() {
  var Cache, crypto, csVer, fs, ltVer, path;

  fs = require('fs');

  path = require('path');

  crypto = require('crypto');

  ltVer = require('./../package.json').version;

  csVer = ((typeof window !== "undefined" && window !== null ? window.CoffeeScript : void 0) || require('coffeescript')).VERSION;

  module.exports = Cache = class Cache {
    constructor(basepath) {
      this.basepath = basepath;
      if (!fs.existsSync(this.basepath)) {
        fs.mkdirSync(this.basepath, 0o755);
      }
    }

    path(source) {
      return path.join(this.basepath, `${csVer}-${ltVer}-${this.prefix}-${this.hash(source)}`);
    }

    get(source) {
      return JSON.parse(fs.readFileSync(this.path(source), 'utf8'));
    }

    set(source, result) {
      return fs.writeFileSync(this.path(source), JSON.stringify(result));
    }

    has(source) {
      return fs.existsSync(this.path(source));
    }

    hash(data) {
      return crypto.createHash('md5').update('' + data).digest('hex').substring(0, 8);
    }

    // Use user config as a "namespace" so that
    // when he/she changes it the cache becomes invalid
    setConfig(config) {
      return this.prefix = this.hash(JSON.stringify(config));
    }

  };

}).call(this);
