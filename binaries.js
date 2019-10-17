const fs = require('fs');
const path = require('path');
const os = require('os');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
const p = os.platform();

const v = pkg.version.split('.');
const bv = `${v[0]}.${v[1]}.${~~(Number.parseInt(v[2]) / 100) * 100}`.split('.').join('_');
const bp = path.resolve(os.homedir(), '.tonlabs', 'binaries', bv);
module.exports = { p, bv, bp };
