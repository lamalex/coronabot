import 'dotenv/config';
import { Textbelt } from '../smsservice';

describe('Texbelt', () => {
    it('sends a text', async () => {
        const sms = new Textbelt(process.env['TEXTBELT_API_KEY'] ?? '');
        const recipient = {
            name: 'Stone Cold',
            phoneNumber: '6666666666',
        };

        let outgoing = sms.send(recipient, 'GIMME A HELLLL YEAH 🍺');
        let res = await outgoing;

        expect(res.status).toBe(200);
    });
});
