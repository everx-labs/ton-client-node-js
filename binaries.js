/*
 * Copyright 2018-2020 TON DEV SOLUTIONS LTD.
 */

const { version, binaries_version } = require('./package.json');
const path = require('path');
const os = require('os');
const p = os.platform();
require('dotenv').config();
const bv = process.env.TON_SDK_BIN_VERSION ? process.env.TON_SDK_BIN_VERSION : (binaries_version || version).split('.')[0];
const bp = path.resolve(os.homedir(), '.tonlabs', 'binaries', bv);
module.exports = { p, bv, bp };
