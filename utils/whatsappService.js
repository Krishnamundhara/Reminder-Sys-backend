const axios = require('axios');

class WhatsAppService {
    constructor() {
        // We'll use the WhatsApp Business API
        this.apiUrl = process.env.WHATSAPP_API_URL;
        this.apiToken = process.env.WHATSAPP_API_TOKEN;
    }

    async sendMessage(from, to, message) {
        try {
            // Format the message according to WhatsApp Business API requirements
            const payload = {
                messaging_product: "whatsapp",
                to: this.formatPhoneNumber(to),
                from: this.formatPhoneNumber(from),
                type: "text",
                text: {
                    body: message
                }
            };

            const response = await axios.post(this.apiUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                messageId: response.data?.messages?.[0]?.id
            };
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    formatPhoneNumber(phone) {
        // Remove any non-digit characters
        const cleaned = phone.replace(/\D/g, '');
        // Ensure number starts with country code
        return cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    }

    generatePaymentReminder(customerName, amount, dueDate) {
        const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);

        const formattedDate = new Date(dueDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return `Dear ${customerName},\n\n` +
               `This is a friendly reminder about the pending payment of ${formattedAmount} ` +
               `due on ${formattedDate}.\n\n` +
               `Please arrange the payment at your earliest convenience.\n\n` +
               `If you have already made the payment, please ignore this message.\n\n` +
               `Thank you for your cooperation.`;
    }
}

module.exports = new WhatsAppService();
