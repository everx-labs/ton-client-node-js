/*
 * Copyright 2018-2019 TON DEV SOLUTIONS LTD.
 *
 * Licensed under the SOFTWARE EVALUATION License (the "License"); you may not use
 * this file except in compliance with the License.  You may obtain a copy of the
 * License at:
 *
 * http://www.ton.dev/licenses
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific TON DEV software governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-bitwise */
import { TONClient } from '../index';

import { SubscriptionContractPackage } from './contracts/SubscriptionContract';
import { WalletContractPackage } from "./contracts/WalletContract";

import init from './init';

const PiggyBankPackage = {
    abi: {
        'ABI version': 0,
        functions: [{
            name: 'transfer',
            signed: true,
            inputs: [{ name: 'to', type: 'bits256' }],
            outputs: [],
        }, {
            name: 'getTargetAmount',
            inputs: [],
            outputs: [{ name: 'amount', type: 'uint64' }],
        }, {
            name: 'getGoal',
            inputs: [],
            outputs: [{ name: 'goal', type: 'uint8[]' }],
        }, {
            name: 'constructor',
            inputs: [
                { name: 'amount', type: 'uint64' },
                { name: 'goal', type: 'uint8[]' },
            ],
            outputs: [],
        }],
    },
    imageBase64: 'te6ccgECHwEAApUAAgE0AgEAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATL/AIn0BSHBAZN49KCbePQN8rSAIPSh8jPiAwEBwAQCASAGBQAp/+ABw8AEhcfABAdMHAfJr0x8B8AKAgHWEQcBAawIAgFIDAkCAWILCgCjt9kOJRb7UTQ1DBxAXj0DjCCEE9kOJRwyMsHyx/OjjGOK8hyz0Fyz0Byz0Bwzws/cM8LH3HPQFzPNQHPMaS+lXHPQM8TlXHPQc8R4snYcPsA2IAA/t1nVP8x1j8BcG149BZxAXj0FsjM7UTQ1v8wzxbJ7VSACAUgQDQEJuWWEepAOAf4xgQEAmAGLCtcmAdcY2DDXC//tR28QbxdvEO1E0NQwcAF49A4w0z8wIbuOTyCAD4BkqYVcoTKLCHBYjj7++QBTbmRCZHlJbnQB7UdvEG8Y+kJvEsjPhkDKB8v/ydCOF8jPhSDPigBAgQEAz0DOAfoCgGvPQM7J2HD7ANjfAYsIDwBwcBIDAe1HbxBvGPpCbxLIz4ZAygfL/8nQjhfIz4Ugz4oAQIEBAM9AzgH6AoBrz0DOydiBAID7ADAAo7iKB9ILfaiaGoYOAC8egcYaZ+YZGfKAAigfSFln8cYxxXkOWeguWegOWegOGeFn7hnhY+456AuZ5qA55jSX0q456Bnicq456DniPFk7Dh9gGxACASAeEgEBMBMCA8/AFRQAGTQ1ygF+kD6QPoAbwSABbQg0wcB8muJ9AWAIPQK8qnXCwCOGSDHAvJt1SDHAPJtIfkBAe1E0NcL//kQ8qiXIMcCktQx3+KAWAQHAFwIBSBsYAgFiGhkACbfZDiUQAAm3WdU/0AIBSB0cAAm5ZYR6mAAJuIoH0ggABTbMIA==',
};

const stringToArray = (string) => {
    return Array.from(new Uint8Array(Buffer.alloc(string.length, string).buffer));
};

const arrayToString = (array) => {
    return Buffer.from(array).toString();
};

const piggyBankParams = {
    amount: 123,
    goal: stringToArray('Some goal'),
};

beforeAll(init);

test('piggyBank', async () => {
    const ton: TONClient = TONClient.shared;
    // Learn dAppID
    const dAppID = '1001'; // Let's assume it's our dApp ID
    // Generate key pair
    const keys = await ton.crypto.ed25519Keypair();
    console.log('[PiggyBank] Wallet keys:', keys);
    // Deploy wallet
    const walletAddress = (await ton.contracts.deploy({
        package: WalletContractPackage,
        constructorParams: {},
        keyPair: keys
    })).address;
    console.log('[PiggyBank] Wallet address:', walletAddress);
    // Get wallet version
    const version = await ton.contracts.run({
        address: walletAddress,
        abi: WalletContractPackage.abi,
        functionName: 'getVersion',
        input: {},
        keyPair: keys,
    });
    console.log('[PiggyBank] Wallet version:', version);

    // Deploy piggy bank
    const piggyBankAddress = (await ton.contracts.deploy({
        package: PiggyBankPackage,
        constructorParams: piggyBankParams,
        keyPair: keys,
    })).address;
    console.log('[PiggyBank] Piggy Bank address:', piggyBankAddress);


    // Deploy subscription
    const subscriptionParams = { wallet: `x${walletAddress}` };
    const subscriptionAddress = (await ton.contracts.deploy({
        package: SubscriptionContractPackage,
        constructorParams: subscriptionParams,
        keyPair: keys,
    })).address;
    console.log('[PiggyBank] Subscription address:', subscriptionAddress);


    // Set subscription account in the wallet
    const setSubscriptionInput = { address: `x${subscriptionAddress}` };
    const setSubscriptionResponse = await ton.contracts.run({
        address: walletAddress,
        abi: WalletContractPackage.abi,
        functionName: 'setSubscriptionAccount',
        input: setSubscriptionInput,
        keyPair: keys,
    });
    console.log('[PiggyBank] Set subscription response:', setSubscriptionResponse);


    const getSubscriptionResponse = await ton.contracts.runLocal({
        address: walletAddress,
        abi: WalletContractPackage.abi,
        functionName: 'getSubscriptionAccount',
        input: {},
    });
    console.log('[PiggyBank] Get subscription response:', getSubscriptionResponse);


    // Call subscribe in subscription
    const subscriptionId = (await ton.crypto.sha512({ text: dAppID })).slice(0, 64);
    console.log('[PiggyBank] Subscription ID:', subscriptionId);
    const subscribeInput = {
        subscriptionId: `x${subscriptionId}`,
        pubkey: `x${keys.public}`,
        to: `x${piggyBankAddress}`,
        value: 123,
        period: 1,
    };
    const subscribeResponse = await ton.contracts.run({
        address: subscriptionAddress,
        abi: SubscriptionContractPackage.abi,
        functionName: 'subscribe',
        input: subscribeInput,
        keyPair: keys,
    });
    console.log('[PiggyBank] Subscribe response:', subscribeResponse);
    expect(subscribeResponse?.output?.subscriptionHash).toBeDefined();

    await ton.close();
});
