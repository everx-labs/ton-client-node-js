import { TONClient } from 'index.js';

import init from './init';

beforeAll(init);

test('basic', async () => {
	const ton = TONClient.shared;
	expect(await ton.config.getVersion()).toEqual('0.9.50');

	try {
        await ton.crypto.hdkeyXPrvDerivePath("???", "");
    } catch (error) {
	    expect(error.source).toEqual('sdk');
	    expect(error.code).toEqual(2018);
    }
});

