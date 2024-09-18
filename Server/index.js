require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');


const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);





async function uploadImage(imageBuffer) {
  try {
    // Specify the image format explicitly
    const processedImageBuffer = await sharp(imageBuffer).jpeg({ force: true }).toBuffer();

    // Upload the processed image to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream({
      folder: 'whatsapp_alerts',
    });

    console.log("check1")

    uploadStream.write(processedImageBuffer);
    uploadStream.end();

    console.log("check2")
    const result = await new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('result', resolve);
    });

    console.log("check3")

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}
async function sendWhatsAppMessage(imageUrl) {
  try {
    const message = await client.messages.create({
      body: `Unknown stranger detected. View image: ${imageUrl}`,
      from: 'whatsapp:+14155238886',  // Your Twilio WhatsApp number
      to: 'whatsapp:+919818270753'    // The recipient's WhatsApp number
    });
    console.log('Message sent successfully. SID:', message.sid);
    return message;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }
    console.log('Image data:', image);
    console.log('MIME type:', req.headers['content-type']);

    // Remove the "data:image/jpeg;base64," prefix if present
    const base64Image = image.replace(/^data:image\/jpeg;base64,/, '');

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Upload image to Cloudinary
    const imageUrl = await uploadImage(imageBuffer);

    // Send WhatsApp message with image link
    const message = await sendWhatsAppMessage(imageUrl);

    res.status(200).json({ success: true, message: 'WhatsApp message sent successfully!', sid: message.sid });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));