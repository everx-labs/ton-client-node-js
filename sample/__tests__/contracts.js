const { readGiverKeys, deploy_with_giver, loadPackage, waitOutMessages } = require('./_/giver');
const { TONClient } = require('ton-client-node-js');


const BankCollectorPackage = loadPackage('BankCollector');
const BankCollectorClientPackage = loadPackage('BankCollectorClient');
const ContractDeployerPackage = loadPackage('ContractDeployer');
const HelloPackage = loadPackage('Hello');
let client;
const dotenv = require('dotenv');
dotenv.config();
const serversConfig = process.env.TON_NETWORK_ADDRESS.replace(/ /gi, '').split(',');

beforeAll(async () => {
    client = await TONClient.create({
        servers: serversConfig,
        log_verbose: false,
    });
    console.log('[Init] Created client is connected to: ', client.config.data && client.config.data.servers);
    await readGiverKeys(client);
});


test('Should deploy contract from contracts with code and data', async () => {
    const { contracts, crypto, queries } = client;
    let deployer = {
        package: ContractDeployerPackage,
        keys: await crypto.ed25519Keypair()
    };
    let hello = {
        package: HelloPackage,
        keys: await crypto.ed25519Keypair()
    }

    const constructor_id = await contracts.getFunctionId({
        abi: hello.package.abi,
        function: 'constructor',
        input: true,
    });

    deployer.address = (await deploy_with_giver(client, {
        package: deployer.package,
        constructorParams: {},
        keyPair: deployer.keys,
    })).address;

    const code = await contracts.getCodeFromImage({
        imageBase64: hello.package.imageBase64,
    });
    const data = await contracts.getDeployData({
        abi: hello.package.abi,
        publicKeyHex: hello.keys.public,
    });

    const result = await contracts.run({
        address: deployer.address,
        abi: deployer.package.abi,
        functionName: 'deployFromCodeAndData',
        input: {
            code: code.codeBase64,
            data: data.dataBase64,
            initial_balance: 300000000,
            constructor_id: constructor_id.id
        },
        keyPair: deployer.keys,
    });

    const helloAddress = result.output.value0;
    const localResponse = await contracts.runLocal({
        address: helloAddress,
        abi: hello.package.abi,
        functionName: 'sayHello',
        input: {},
        keyPair: null,
        waitParams: {
            timeout: 30000
        }
    });
    expect(localResponse.output.value0).toBeDefined();
});

test('Should work all contract function from sample BankCollector & BankCollectorClient', async () => {
    const { contracts, crypto, queries } = client;
    let bankCollector = {
        keys: await crypto.ed25519Keypair()
    };
    let bankCollectorClient = {
        keys: await crypto.ed25519Keypair()
    }
    bankCollector.address = (await deploy_with_giver(client, {
        package: BankCollectorPackage,
        constructorParams: {},
        keyPair: bankCollector.keys,
    })).address;

    expect(bankCollector.address).toBeDefined();

    bankCollectorClient.address = (await deploy_with_giver(client, {
        package: BankCollectorClientPackage,
        constructorParams: {
            _bankCollector: bankCollector.address
        },
        keyPair: bankCollectorClient.keys,
    })).address;
    expect(bankCollectorClient.address).toBeDefined();

    let result = await contracts.run({
        address: bankCollector.address,
        abi: BankCollectorPackage.abi,
        functionName: 'addClient',
        input: {
            addr: bankCollectorClient.address,
            debtAmount: 300000
        },
        keyPair: bankCollector.keys,
    });

    result = await contracts.run({
        address: bankCollectorClient.address,
        abi: BankCollectorClientPackage.abi,
        functionName: 'getDebtAmount',
        input: {},
        keyPair: bankCollectorClient.keys,
    });
    expect(result.output.value0).toBe("0x0");


    result = await contracts.run({
        address: bankCollectorClient.address,
        abi: BankCollectorClientPackage.abi,
        functionName: 'obtainDebtAmount',
        input: {},
        keyPair: bankCollectorClient.keys,
    });
    await waitOutMessages(client, result.transaction);

    result = await contracts.run({
        address: bankCollectorClient.address,
        abi: BankCollectorClientPackage.abi,
        functionName: 'getDebtAmount',
        input: {},
        keyPair: bankCollectorClient.keys,
    });

    expect(result.output.value0).toBe("0x493e0");
});
