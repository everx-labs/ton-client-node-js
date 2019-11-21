const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const zlib = require('zlib');

function openHttpSource(binariesSource, src, onStart, onError) {
    const url = `${binariesSource}/${src}.gz`;
    process.stdout.write(` from ${url} ...`);
    const request = http.get(url, response => {
        if (response.statusCode === 200) {
            request.on("error", err => {
                onError(err);
            });
            onStart(response);
        } else {
            onError({
                message: `Download failed with ${response.statusCode}: ${response.statusMessage}`,
            });
        }
    });
}

function openFileSource(binariesSource, src, onStart, onError) {
    let dir = binariesSource;
    if (/^file:/i.test(dir)) {
        dir = binariesSource.substr(5);
    }
    if (dir.startsWith('~')) {
        dir = path.resolve(os.homedir(), dir.substr(dir.startsWith('~/') ? 2 : 1));
    }
    const srcPath = path.resolve(dir, `${src}.gz`);
    process.stdout.write(` from ${srcPath} ...`);
    const stream = fs.createReadStream(srcPath, {});
    stream.on("error", err => {
        onError(err);
    });
    onStart(stream);
}


function downloadAndGunzip(binariesSource, dest, src) {
    const openSource = /^https?:\/\//i.test(binariesSource)
        ? openHttpSource
        : openFileSource;
    return new Promise((resolve, reject) => {
        openSource(binariesSource, src, (stream) => {
            fs.mkdirSync(path.dirname(path.resolve(dest)), ({ recursive: true }: any));
            let file = fs.createWriteStream(dest, { flags: "w" });
            let opened = false;
            const failed = (err) => {
                if (file) {
                    const f = file;
                    file = null;
                    f.close();

                    fs.unlink(dest, () => {
                    });
                    reject(err);
                }
            };

            file.on("finish", () => {
                if (opened && file) {
                    resolve();
                }
            });

            file.on("open", () => {
                opened = true;
            });

            file.on("error", err => {
                if (err.code === "EEXIST") {
                    if (file) {
                        file.close();
                    }
                    reject("File already exists");
                } else {
                    failed(err);
                }
            });

            const unzip = zlib.createGunzip();
            unzip.pipe(file);
            stream.pipe(unzip);

        }, reject);
    });
}

export function getBinariesVersion(packageJsonPath) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath).toString('utf8'));
    const v: string[] = pkg.version.split('.');
    return `${v[0]}_${v[1]}_${~~(Number.parseInt(v[2]) / 100) * 100}`;
}

export async function ensureBinaries(packageJsonPath, dstPath, files) {
    const p = os.platform();
    const v = getBinariesVersion(packageJsonPath);
    const binariesSource = process.env.TC_BIN_SRC || 'http://sdkbinaries.tonlabs.io';
    for (const entry of Object.entries(files)) {
        const dstParts = entry[0].split('?');
        const dstPlatform = dstParts.length > 1 ? dstParts[0].toLowerCase() : p;
        const dst = dstParts[dstParts.length - 1];
        const fileDstPath = path.resolve(dstPath, dst);
        if (dstPlatform === p && !fs.existsSync(fileDstPath)) {
            const src = entry[1].replace(/{v}/gi, v).replace(/{p}/gi, p);
            process.stdout.write(`Downloading ${dst}`);
            await downloadAndGunzip(binariesSource, fileDstPath, src);
            process.stdout.write('\n');
        }
    }
}

