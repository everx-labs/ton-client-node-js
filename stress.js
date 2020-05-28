const { TONClient } = require('./index');
const v8 = require('v8');

function formatMem(value, usePlus) {
    return `${(value > 0 && usePlus) ? '+' : ''}${value / 1000 / 1000}`;
}

(async () => {
    const reportDelay = 5000;
    let lastIndex = 0;
    let lastUsedHeapSize = v8.getHeapStatistics().used_heap_size;
    let lastTime = Date.now();
    const report = (index, count) => {
        const processed = index - lastIndex;
        if (processed <= 0) {
            return;
        }
        const time = Date.now();
        const usedHeapSize = v8.getHeapStatistics().used_heap_size;
        const memUsed = formatMem(usedHeapSize, false);
        const memDelta = formatMem(usedHeapSize - lastUsedHeapSize, true);
        console.log(`${Math.round(index * 100 / count)}% – ${Math.round((processed / (time - lastTime) * 1000))} p/s memory ${memUsed} MB ${memDelta}`);
        lastIndex = index;
        lastUsedHeapSize = usedHeapSize;
        lastTime = time;
    }

    const client = await TONClient.create({ servers: [] });
    let result = '';
    const count = 10000000;
    const g = [];
    for (let i = 0; i < count; i += 1) {
        // result = await client.config.getVersion();
        result = await client.crypto.randomGenerateBytes(10000);
        g.push(() => { if (result.length > 1000000) console.log('>>>', 1); });
        if (Date.now() > (lastTime + reportDelay)) {
            report(i, count);
        }
        if (g.length > 10000) {
            const f = g.shift();
            f();
        }
    }
    report(count, count);
    console.log('>>>', result);
})();

process.title = 'stress';
