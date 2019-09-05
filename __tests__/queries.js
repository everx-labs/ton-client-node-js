import { TONClient } from "../src";
import init from './init';

beforeAll(init);

test('subscribe', async () => {
    const ton = TONClient.shared;
    const subscription = ton.queries.blocks.subscribe({
    }, '_key', (e, doc) => {
        console.log('>>>', doc);
    });
    return new Promise((resolve) => {
        setTimeout(() => {
            subscription.unsubscribe();
            resolve();
        }, 10*60*1000);
    })
});


test('Transaction List', async () => {
    const ton = TONClient.shared;
    const transaction = await ton.queries.transactions.query({
            _key: { eq: 'e19948d53c4fc8d405fbb8bde4af83039f37ce6bc9d0fc07bbd47a1cf59a8465'},
            status: { in: ["Preliminary", "Proposed", "Finalized"] }
    }, '_key now status', [], 1);
    console.log('>>>', transaction);
    // expect(transaction[0].id).toEqual('e19948d53c4fc8d405fbb8bde4af83039f37ce6bc9d0fc07bbd47a1cf59a8465');
});

test('All Accounts', async () => {
    const ton = TONClient.shared;
    const docs = await ton.queries.accounts.query({
    }, '_key storage { balance { Grams } }');
    console.log('>>>', docs);
});

test('Message', async () => {
    const ton = TONClient.shared;
    const messages = await ton.queries.messages.query({
        match: {
            id: '3a8e38b419a452fe7a0073e71c083f926055d0f249485ab9f8ca6e9825c20b8c'
        }
    }, 'body header { ExtOutMsgInfo { created_at } }');
    expect(messages[0].header.ExtOutMsgInfo.created_at).toEqual(1562342740);
});

test('Ranges', async () => {
    const ton = TONClient.shared;
    const messages = await ton.queries.messages.query({
            header: { ExtOutMsgInfo: { created_at: { gt: 1562342740 } } },
    }, 'body header { ExtOutMsgInfo { created_at } }');
    expect(messages[0].header.ExtOutMsgInfo.created_at).toBeGreaterThan(1562342740);
});

test('Wait For', async () => {
    const ton = TONClient.shared;
    const data = await ton.queries.transactions.waitFor({
        now: { '>': 1563449 },
    }, '_key status');
    console.log('>>>', data);
    expect(data.status).toEqual('Finalized');
});

