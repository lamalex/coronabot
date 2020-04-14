'use strict';
const axios = require('axios');

const makeResponse = (code, msg) => {
    return {
        statusCode: code,
        body: JSON.stringify({
            message: msg
        })
    }
}


module.exports.nocorona = async event => {
    console.debug(`incoming: ${JSON.stringify(event)}`);

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
    const toSend = numbers.map(number => {
        let payload = {
            phone: number,
            key: process.env['TEXTBELT_API_KEY'],
            replyWebhookUrl: replyWebhookUrl,
            message: triggedFromReply
                ? `TMC said: ${JSON.parse(event.body).text}`
                : 'TMC, this is Launi. No corona.',
        }

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
