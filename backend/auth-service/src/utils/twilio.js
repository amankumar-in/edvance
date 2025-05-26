const twilio = require('twilio');

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Initialize the Twilio client
const client = twilio(accountSid, authToken);

// Send a 6 digit OTP to the user's phone number
async function sendOTP(to, body) {
  return await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
}

module.exports = { sendOTP };