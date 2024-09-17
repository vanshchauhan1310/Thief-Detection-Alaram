require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");
const multer = require('multer');
const upload = multer({ dest: './uploads/' });

app.use(express.json());

app.use(cors())

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN);

const client = require('twilio')(accountSid, authToken);

async function createMessage(image) {
  client.messages.create({
    body: 'unknown stranger detected',
    from: 'whatsapp:+14155238886',
    to: 'whatsapp:+919818270753',
    mediaUrl: `http://localhost:3000/uploads/${image.filename}`
  })
  .then(message => console.log(message.sid))
}

app.post('/api/send-whatsapp', upload.single('image'), async (req, res) => {
  try {
    const image = req.file;
    console.log('Uploaded file:', image);
    console.log('File path:', image.path);
    console.log('File filename:', image.filename);
    console.log('File mimetype:', image.mimetype);
    console.log('File size:', image.size);

    const message = await createMessage(image);
    res.status(200).json({ success: true, message: 'WhatsApp message sent successfully!' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/uploads/:filename', (req, res) => {
  res.sendFile(__dirname + `/uploads/${req.params.filename}`);
});

app.listen(3000, () => console.log('Server running on port 3000'));