const {
    deploy_with_giver,
    get_grams_from_giver,
    readGiverKeys,
    get_giver_address,
    add_deployed_contract
} = require('./giver');

const dotenv = require('dotenv');
dotenv.config();
const { TONClient } = require('ton-client-node-js');

const nodeSe = !!process.env.USE_NODE_SE
    && process.env.USE_NODE_SE.toLowerCase() !== 'false'
    && process.env.USE_NODE_SE !== '0';

if (!process.env.TON_NETWORK_ADDRESS) {
    throw new Error('Servers list is not specified');
}
const serversConfig = process.env.TON_NETWORK_ADDRESS.replace(/ /gi, '').split(',');

const fs = require('fs');
const path = require('path');

function loadPackage(name) {
    const base = path.resolve(process.cwd(), '__tests__', 'contracts');
    const abi = path.resolve(base, `${name}.abi.json`);
    const tvc = path.resolve(base, `${name}.tvc`);
    return {
        abi: JSON.parse(fs.readFileSync(abi, 'utf8')),
        imageBase64: fs.readFileSync(tvc).toString('base64'),
    }
}
let client;
async function init() {
     client = await TONClient.create({
        servers: serversConfig,
        log_verbose: false,
        //tracer: createJaegerTracer(''),
        accessKey: "ZUj06399Bb2BXhwJm0S0"
    });
    console.log('[Init] Created client is connected to: ', client.config.data && client.config.data.servers);
    await readGiverKeys(client);
    return client;
}


async function done() {

}


module.exports = {
    init,
    done,
    get_grams_from_giver,
    deploy_with_giver,
    add_deployed_contract,
    get_giver_address,
    nodeSe,
    loadPackage,
}

