/*
 * Copyright 2018-2020 TON DEV SOLUTIONS LTD.
 */

import {TONClient} from '../index.js'
import {bv} from '../binaries';

require('dotenv').config();

test("Binaries", async () => {
    const client = await TONClient.create({ servers: [] });
    const version = await client.config.getVersion();
    console.log(`version: ${version}`)
    if (process.env.TON_SDK_BIN_VERSION) {
        expect(version)
            .toEqual(process.env.TON_SDK_BIN_VERSION);
    } else {
        expect(version.split('.')[0])
            .toEqual(bv);
    }
});

