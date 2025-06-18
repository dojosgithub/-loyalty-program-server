import { Twilio } from "twilio";

const client = new Twilio(process.env.accountSid, process.env.authToken);

export const sendSMS = async (body: string, to: string ) => {
    if (process.env.SEND_SMS && to) {
      await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });
      console.log(to)
    }
  };
  