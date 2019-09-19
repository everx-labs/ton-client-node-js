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

// @flow
import { TONClient } from '../index';

import { WalletContractPackage } from './contracts/WalletContract';
import type { TONContractPackage } from "ton-client-js/src/modules/TONContractsModule";

import init from './init';

beforeAll(init);
afterAll(() => {
    TONClient.shared.close();
    console.log('>>>', 'done');
});

const richAddress = '0000000000000000000000000000000000000000000000000000000000000000';

const walletKeys = {
    public: 'fb98b2541ba805648f25eb469dd4766fcdde03a2cfe6fb41d8c1571c29407ca3',
    secret: '7bfe77bbd3ad57ada9ed323da83504723e3af7cd3ba68b02d3c8335f75e0a24e',
};

const walletAddress = 'adb63a228837e478c7edf5fe3f0b5d12183e1f22246b67712b99ec538d6c5357';

test('load', async () => {
    const rich = await TONClient.shared.contracts.load({
        address: richAddress,
        includeImage: false,
    });
    expect(rich.id).toEqual(richAddress);

    const contract = await TONClient.shared.contracts.load({
        address: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF',
        includeImage: false,
    });
    expect(contract.id).toBeNull();
    expect(contract.balanceGrams).toBeNull();

    const w = await TONClient.shared.contracts.load({
        address: walletAddress,
        includeImage: false,
    });
    expect(w.id).toEqual(walletAddress);
    expect(Number.parseInt(w.balanceGrams)).toBeGreaterThan(0);
});

test('deploy', async () => {
    const { contracts } = TONClient.shared;
    const deployed = await contracts.deploy({
        package: WalletContractPackage,
        constructorParams: {},
        keyPair: walletKeys,
    });
    expect(deployed.address).toEqual(walletAddress);
});

test('deploy_new', async () => {
    const ton = TONClient.shared;
    const keys = await ton.crypto.ed25519Keypair();
    const deployed = await ton.contracts.deploy({
        package: WalletContractPackage,
        constructorParams: {},
        keyPair: keys,
    });
});

test('test', async () => {
    const ton = TONClient.shared;
    await ton.contracts.sendGrams({
        fromAccount: richAddress,
        toAccount: walletAddress,
        amount: 100,
    });
});

test('run', async () => {
    const { contracts } = TONClient.shared;
    const result = await contracts.run({
        address: walletAddress,
        functionName: 'getVersion',
        abi: WalletContractPackage.abi,
        input: {},
        keyPair: walletKeys,
    });
    console.log('[Contracts] Get version response:', result);
});

test('decodeInputMessageBody', async () => {
    const { contracts } = TONClient.shared;
    const body = 'te6ccoEBAgEAcwARcwEbACfvUIcBgJTr3AOCAGABAMDr2GubWXYR6wuk6WFn4btjW3w+DbidhSrKArHbqCaunLGN9LwAbQFT9kyOpN6DR6DJbuKkvC94KwJgan7xeTUHS89H/vKbWZbzZEHu4euhqvQE2I9aW+PNdn2BKZJXlA4=';

    const result = await contracts.decodeInputMessageBody({
        abi: WalletContractPackage.abi,
        bodyBase64: body
    });

    expect(result.function).toEqual('createLimit');
    expect(result.output).toEqual({ type : "0x1", value: "0x3b9aca00", meta: "x01" });
});

const events_package: TONContractPackage = {
    abi: {
        'ABI version': 0,
        functions: [{
            name: 'constructor',
            inputs: [
            ],
            outputs: [
            ]
        }, {
            name: 'emitValue',
            inputs: [
                {name:'id',type:'uint256'}
            ],
            outputs: [
            ]
        }, {
            name: 'returnValue',
            inputs: [
                {name:'id',type:'uint256'}
            ],
            outputs: [
                {name:'value0',type:'uint256'}
            ]
        }],
        events: [{
            name: 'EventThrown',
            inputs: [
                {name:'id',type:'uint256'}
            ]
        }]
    },
    imageBase64: "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"
};

test('filterOutput', async () => {
    const ton = TONClient.shared;
    const keys = await ton.crypto.ed25519Keypair();
    const deployed = await ton.contracts.deploy({
        package: events_package,
        constructorParams: {},
        keyPair: keys,
    });

    const resultEmit = await ton.contracts.run({
        address: deployed.address,
        functionName: 'emitValue',
        abi: events_package.abi,
        input: {id: "0"},
        keyPair: keys,
    });
    console.log('[Contracts] emitValue:', resultEmit);

    const resultReturn = await ton.contracts.run({
        address: deployed.address,
        functionName: 'returnValue',
        abi: events_package.abi,
        input: {id: "0"},
        keyPair: keys,
    });
    console.log('[Contracts] returnValue:', resultReturn);
});

const foo_package: TONContractPackage = {
    abi: {
        "ABI version": 0,
        "functions": [{
            "name": "requestPayment_external",
            "inputs": [{"name": "cardId", "type": "uint256"}, {"name": "paymentId", "type": "uint256"}],
            "outputs": []
        }, {
            "name": "constructor",
            "inputs": [],
            "outputs": []
        }, {
            "name": "grantAccess_external",
            "inputs": [{"name": "srvAddress", "type": "uint256"}],
            "outputs": []
        }, {
            "name": "checkAccess_external",
            "inputs": [{"name": "confidant", "type": "uint256"}],
            "outputs": []
        }, {
            "name": "revokeAccess_external",
            "inputs": [{"name": "confidant", "type": "uint256"}],
            "outputs": []
        }, {
            "name": "storeCard_external",
            "inputs": [{"name": "card", "type": "uint64[]"}, {"name": "desc", "type": "uint64[]"}],
            "outputs": []
        }, {
            "name": "storeTokenizedCard_external",
            "inputs": [{"name": "token", "type": "uint64[]"}, {"name": "desc", "type": "uint64[]"}],
            "outputs": []
        }, {
            "name": "getCardInfo_external",
            "inputs": [{"name": "cardId", "type": "uint256"}],
            "outputs": []
        }, {
            "name": "getCard_external",
            "inputs": [{"name": "cardId", "type": "uint256"}, {"name": "seqNo", "type": "uint32"}],
            "outputs": []
        }, {
            "name": "deleteCard_external",
            "inputs": [{"name": "cardId", "type": "uint256"}],
            "outputs": []
        }, {
            "name": "getPayment_external",
            "inputs": [{"name": "paymentId", "type": "uint256"}],
            "outputs": []
        }, {
            "name": "updatePaymentState_external",
            "inputs": [{"name": "paymentId", "type": "uint256"}, {"name": "state", "type": "uint8"}, {"name": "data", "type": "uint256"}],
            "outputs": []
        }]
    },
    imageBase64: "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"
};

test('deploy_foo_contract', async () => {
    const ton = TONClient.shared;
    const keys = await ton.crypto.ed25519Keypair();
    const deployed = await ton.contracts.deploy({
        package: foo_package,
        constructorParams: {},
        keyPair: keys,
    });
});
