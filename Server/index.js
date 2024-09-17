require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");

app.use(express.json());

app.use(cors())

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN);

const client = require('twilio')(accountSid, authToken);

async function createMessage() {
  client.messages.create({
      body: 'unknown stranger detected',
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+919818270753'
  })
  .then(message => console.log(message.sid))
}

app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const message = await createMessage();
    res.status(200).json({ success: true, message: 'WhatsApp message sent successfully!' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));