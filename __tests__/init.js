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

import { TONClient } from '../index.js';

jest.setTimeout(600000); // 1 min

export default async () => {
    TONClient.shared.config.setData({
        defaultWorkchain: 0,
        servers: ["http://0.0.0.0"],
        log_verbose: true,
    });
    await TONClient.shared.setup();
};
