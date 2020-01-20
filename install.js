/*
 * Copyright 2018-2020 TON DEV SOLUTIONS LTD.
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

const fs = require('fs');
const path = require('path');
const http = require('http');
const zlib = require('zlib');

const {p, bv, bp} = require('./binaries');
let root = process.cwd();
const binariesHost = 'sdkbinaries.tonlabs.io';


function downloadAndGunzip(dest, url) {
    return new Promise((resolve, reject) => {

        const request = http.get(url, response => {
            if (response.statusCode !== 200) {
                reject({
                    message: `Download failed with ${response.statusCode}: ${response.statusMessage}`,
                });
                return;
            }
            let file = fs.createWriteStream(dest, { flags: "w" });
            let opened = false;
            const failed = (err) => {
                if (file) {
                    file.close();
                    file = null;

                    fs.unlink(dest, () => {
                    });
                    reject(err);
                }
            };

            const unzip = zlib.createGunzip();
            unzip.pipe(file);


            response.pipe(unzip);


            request.on("error", err => {
                failed(err);
            });

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
                    file.close();
                    reject("File already exists");
                } else {
                    failed(err);
                }
            });
        });
    });

}


async function dl(dst, src) {
    const dst_path = path.join(root, dst);
    const src_url = `http://${binariesHost}/${src}.gz`;
    process.stdout.write(`Downloading ${dst} from ${binariesHost} ...`);
    await downloadAndGunzip(dst_path, src_url);
    process.stdout.write('\n');
}

async function main() {
    try {
        const testFile = path.join(root, '__testwritable__.txt');
        fs.writeFileSync(testFile, 'test writable', {encoding: 'utf8'});
        fs.unlinkSync(testFile);
    } catch {
        root = bp;
        if (!fs.existsSync(bp)) {
            fs.mkdirSync(bp, { recursive: true });
        }
    }
    console.log('Downloading binaries to:', root);
    await dl(`tonclient.node`, `tonclient_${bv}_nodejs_addon_${p}`);
    if (p === 'darwin') {
        await dl('libtonclientnodejs.dylib', `tonclient_${bv}_nodejs_dylib_${p}`);
    }
}

(async () => {
    try {
        await main();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();

