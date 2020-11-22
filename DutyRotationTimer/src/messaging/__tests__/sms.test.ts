import 'dotenv/config'
import { Textbelt, providerFactory } from '../sms'

describe('providerFactory', () => {
    it('gives a provider with non-zero api key', () => {
        const sut = providerFactory()
        expect(sut).toBeDefined()
    })
})

describe('Texbelt', () => {
    it('sends a text', async () => {
        const sms = new Textbelt(process.env['TEXTBELT_API_KEY'] ?? '')
        const recipient = {
            name: 'Stone Cold',
            phoneNumber: '6666666666',
        }

        let outgoing = sms.send(recipient, 'GIMME A HELLLL YEAH 🍺')
        let res = await outgoing

        expect(res.status).toBe(200)
        expect(res.message).toHaveProperty('success', true)
    })
})
