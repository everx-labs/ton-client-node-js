import { TONClient } from '../index.js';

jest.setTimeout(600000); // 1 min

export default async () => {
    TONClient.shared.config.setData({
        defaultWorkchain: 0,
        servers: ["http://0.0.0.0"],
        queriesServer: "http://0.0.0.0:4000/graphql",
        log_verbose: true,
    });
    await TONClient.shared.setup();
};
