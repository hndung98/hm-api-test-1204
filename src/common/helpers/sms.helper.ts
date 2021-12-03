import crypto from "crypto";
const twilio = require('twilio');

export default class SMSHelper {
  transporter: any

  static genCode() {
    const hex = crypto.randomBytes(2).toString("hex");
    const codes = Array(hex.length)
      .fill(0)
      .map((v, index) => hex.charCodeAt(index) % 10);
    return codes.join("");
  }

  static async sendSMS(phoneNumber: string, message: string) {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // this.transporter.messages
    //   .create({
    //     body: phoneNumber,
    //     from: '+17176162819',
    //     to: message
    //   })
    //   .then((message: any) => console.log(message.sid));
    return await client.messages
      .create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      })
      .catch((error: any) => {
        return { error: error.message };
      });
  }

}
