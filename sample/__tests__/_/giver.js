const os = require('os');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const nodeSe = !!process.env.USE_NODE_SE
    && process.env.USE_NODE_SE.toLowerCase() !== 'false'
    && process.env.USE_NODE_SE !== '0';

function loadPackage(name) {
    const base = path.resolve(process.cwd(), '__tests__', 'contracts');
    const abi = path.resolve(base, `${name}.abi.json`);
    const tvc = path.resolve(base, `${name}.tvc`);
    return {
        abi: JSON.parse(fs.readFileSync(abi, 'utf8')),
        imageBase64: fs.readFileSync(tvc).toString('base64'),
    }
}

async function readGiverKeys(client) {
    try {
        let keysPath = path.resolve(os.homedir(), 'giverKeys.json');
        giverWalletKeys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
        console.log('Use giver keys from ', keysPath);
    } catch (error) {
        console.log('Custom giver keys not provided. Use default');
    }

    giverWalletAddressHex = await getGiverAddress(client);
    giverWalletAddressBase64 = (await client.contracts.convertAddress({
        address: giverWalletAddressHex,
        convertTo: "Base64",
        base64Params: {
            test: false,
            bounce: false,
            url: false
        }
    })).address;
    if (!nodeSe) {
        console.log(`Giver address: ${giverWalletAddressHex} (${giverWalletAddressBase64})`);
    }
}


async function getGiverAddress(client) {
    return (await client.contracts.createDeployMessage({
        package: GiverWalletPackage,
        constructorParams: {},
        keyPair: giverWalletKeys,
    })).address;
}

const nodeSeGiverAddress = '0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94';
const nodeSeGiverAbi =
    {
        'ABI version': 1,
        'functions': [
            {
                'name': 'constructor',
                'inputs': [],
                'outputs': []
            },
            {
                'name': 'sendGrams',
                'inputs': [
                    {
                        'name': 'dest',
                        'type': 'address'
                    },
                    {
                        'name': 'amount',
                        'type': 'uint64'
                    }
                ],
                'outputs': []
            }
        ],
        'events': [],
        'data': []
    };
let giverWalletAddressHex = '';
let giverWalletAddressBase64 = '';
let giverWalletKeys;
const GiverWalletPackage = {
    abi: {
        "ABI version": 2,
        "header": ["time", "expire"],
        "functions": [
            {
                "name": "upgrade",
                "inputs": [
                    { "name": "newcode", "type": "cell" }
                ],
                "outputs": []
            },
            {
                "name": "sendTransaction",
                "inputs": [
                    { "name": "dest", "type": "address" },
                    { "name": "value", "type": "uint128" },
                    { "name": "bounce", "type": "bool" }
                ],
                "outputs": []
            },
            {
                "name": "getMessages",
                "inputs": [],
                "outputs": [
                    {
                        "components": [{ "name": "hash", "type": "uint256" }, {
                            "name": "expireAt",
                            "type": "uint64"
                        }], "name": "messages", "type": "tuple[]"
                    }
                ]
            },
            {
                "name": "constructor",
                "inputs": [],
                "outputs": []
            }
        ],
        "events": []
    },
    imageBase64: 'te6ccgECGgEAA9sAAgE0BgEBAcACAgPPIAUDAQHeBAAD0CAAQdgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAIm/wD0pCAiwAGS9KDhiu1TWDD0oQkHAQr0pCD0oQgAAAIBIAwKAfz/fyHtRNAg10nCAZ/T/9MA9AX4an/4Yfhm+GKOG/QFbfhqcAGAQPQO8r3XC//4YnD4Y3D4Zn/4YeLTAAGOEoECANcYIPkBWPhCIPhl+RDyqN4j+EL4RSBukjBw3rry4GUh0z/THzQx+CMhAb7yuSH5ACD4SoEBAPQOIJEx3rMLAE7y4Gb4ACH4SiIBVQHIyz9ZgQEA9EP4aiMEXwTTHwHwAfhHbpLyPN4CASASDQIBWBEOAQm46Jj8UA8B/vhBbo4S7UTQ0//TAPQF+Gp/+GH4Zvhi3tFwbW8C+EqBAQD0hpUB1ws/f5NwcHDikSCONyMjI28CbyLIIs8L/yHPCz8xMQFvIiGkA1mAIPRDbwI0IvhKgQEA9HyVAdcLP3+TcHBw4gI1MzHoXwPIghB3RMfighCAAAAAsc8LHyEQAKJvIgLLH/QAyIJYYAAAAAAAAAAAAAAAAM8LZoEDmCLPMQG5lnHPQCHPF5Vxz0EhzeIgyXH7AFswwP+OEvhCyMv/+EbPCwD4SgH0AMntVN5/+GcAxbkWq+f/CC3Rxt2omgQa6ThAM/p/+mAegL8NT/8MPwzfDFHDfoCtvw1OADAIHoHeV7rhf/8MTh8Mbh8Mz/8MPFvfCNJeRnJuPwzcXwAaPwhZGX//CNnhYB8JQD6AGT2qj/8M8AIBIBUTAde7Fe+TX4QW6OEu1E0NP/0wD0Bfhqf/hh+Gb4Yt76QNcNf5XU0dDTf9/XDACV1NHQ0gDf0SIiInPIcc8LASLPCgBzz0AkzxYj+gKAac9Acs9AIMki+wBfBfhKgQEA9IaVAdcLP3+TcHBw4pEggUAJKOLfgjIgG7n/hKIwEhAYEBAPRbMDH4at4i+EqBAQD0fJUB1ws/f5NwcHDiAjUzMehfA18D+ELIy//4Rs8LAPhKAfQAye1Uf/hnAgEgFxYAx7jkYYdfCC3Rwl2omhp/+mAegL8NT/8MPwzfDFvamj8IXwikDdJGDhvXXlwMvwAfCFkZf/8I2eFgHwlAPoAZPaqfAeQfYIQaHaPdqn4ARh8IWRl//wjZ4WAfCUA+gBk9qo//DPACAtoZGAAtr4QsjL//hGzwsA+EoB9ADJ7VT4D/IAgAdacCHHAJ0i0HPXIdcLAMABkJDi4CHXDR+S8jzhUxHAAJDgwQMighD////9vLGS8jzgAfAB+EdukvI83o',
};
const giverRequestAmount = 5_000_000_000;

async function check_giver(client) {

    const accounts = await client.queries.accounts.query({
            id: { eq: giverWalletAddressHex }
        },
        'acc_type balance');

    if (accounts.length === 0) {
        throw `Giver wallet does not exist. Send some grams to ${giverWalletAddressHex} (${giverWalletAddressBase64})`;
    }

    if (!(accounts[0]['balance']) ||
        //$FlowFixMe
        BigInt(accounts[0]['balance']) < giverRequestAmount) {
        throw `Giver has no money. Send some grams to ${giverWalletAddressHex} (${giverWalletAddressBase64})`;
    }
}

async function get_grams_from_giver(client, account, amount) {
    const { contracts, queries } = client;

    console.time(`Get grams from giver to ${account}`);

    let params;
    if (nodeSe) {
        params = {
            address: nodeSeGiverAddress,
            functionName: 'sendGrams',
            abi: nodeSeGiverAbi,
            input: {
                dest: account,
                amount
            },
        };
    } else {
        await check_giver(client);
        params = {
            address: giverWalletAddressHex,
            functionName: 'sendTransaction',
            abi: GiverWalletPackage.abi,
            input: {
                dest: account,
                value: amount,
                bounce: false
            },
            keyPair: giverWalletKeys,
        };
    }
    const result = await contracts.run(params);
    await waitOutMessages(client, result.transaction);
    console.timeEnd(`Get grams from giver to ${account}`);
}

async function deploy_with_giver(client, params) {
    const { contracts } = client;
    const address = (await contracts.getDeployData({
        ...params.package,
        initParams: params.initParams,
        publicKeyHex: params.keyPair.public,
        workchainId: params.workchainId
    })).address || "";
    await get_grams_from_giver(client, address, giverRequestAmount);
    console.log(`Deployed test contract address ${address}`);

    return contracts.deploy(params);
}

async function waitOutMessages(client, transaction) {
    for (const msg of (transaction.out_messages || [])) {
        if (msg.msg_type === 0) {
            //console.log(`Giver. Wait for ${msg.id || "Empty ID"}`);
            await client.queries.transactions.waitFor(
                {
                    in_msg: { eq: msg.id },
                    status: { eq: 3 },
                },
                'lt'
            );
        }
    }
}

module.exports = {
    loadPackage,
    deploy_with_giver,
    readGiverKeys,
    waitOutMessages
}
