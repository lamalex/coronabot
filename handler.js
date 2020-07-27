'use strict';
const axios = require('axios');

const makeResponse = (code, msg) => {
    return {
        statusCode: code,
        body: JSON.stringify({
            message: msg,
        }),
    };
};

const isNDaysFrom = (start, n) => {
    let today = (Date.now() / 1000) | 0;
    let initial = (new Date(start).getTime() / 1000) | 0;
    return (((today - initial) / 86400) | 0) % n == 0;
};

module.exports.nocorona = async (event) => {
    console.debug(`incoming: ${JSON.stringify(event)}`);

    if (
        !isNDaysFrom(
            process.env['ONCOMING_START_DATE'],
            process.env['DUTY_ROTATION']
        )
    ) {
        return;
    }

    const triggedFromReply = event['rawPath'] !== undefined;

    const numbersStr = process.env['TEXT_THESE_NUMBERS'];
    if (!numbersStr) {
        const msg = 'No numbers were present to load';
        console.error(msg);
        return makeResponse(500, msg);
    }

    const replyWebhookUrl = `${process.env['API_URL']}/nocorona/response`;

    // If a reply happens only send to me
    const numbers = numbersStr.split(',', triggedFromReply ? 1 : -1);
    const toSend = numbers.map((number) => {
        let payload = {
            phone: number,
            key: process.env['TEXTBELT_API_KEY'],
            replyWebhookUrl: replyWebhookUrl,
            message: triggedFromReply
                ? `TMC said: ${JSON.parse(event.body).text}`
                : 'TMC, this is Launi. No corona.',
        };

        console.debug(`Texting: ${JSON.stringify(payload)}`);
        return axios.post('https://textbelt.com/text', payload);
    });

    try {
        const { data } = await axios.all(toSend);
        if (!data.success) throw Error(data.error);
    } catch (error) {
        return makeResponse(500, error);
    }

    return makeResponse(200, 'Get some sleep. You deserve it');
};
