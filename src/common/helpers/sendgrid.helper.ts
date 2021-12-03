const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);

export default class SendGridHelper {
  static async sendFull(
    from: string,
    to: string,
    subject: string,
    text: string,
    html: string
  ) {
    const msg = { from, to, subject, text, html };

    return await sgMail.send(msg).catch((error: any) => {
      return { error: error.message };
    });
  }

  static async send(to: string, subject: string, html: string) {
    const fromEmail = process.env.ADMIN_EMAIL || "doubledateinc@hotmail.com";
    const text = process.env.APP_NAME || "MTF";

    return await SendGridHelper.sendFull(fromEmail, to, subject, text, html);
  }
}
