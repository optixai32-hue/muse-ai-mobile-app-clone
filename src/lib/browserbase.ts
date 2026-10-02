import Browserbase from '@browserbasehq/sdk';

export const GetBrowserbase = () => {
    const apiKey = process.env.BROWSERBASE_API_KEY;

    return new Browserbase({
        apiKey
    })
}