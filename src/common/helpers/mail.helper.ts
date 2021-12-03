import * as nodemailer from 'nodemailer'
import * as handlebars from 'handlebars'
import path from 'path'
import fs from 'fs'
import moment from 'moment'


export default class MailHelper {
  PREFIX_EMAIL_SUBJECT = process.env.APP_NAME

  transporter: nodemailer.Transporter
  from: string
  frontendHost: string

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      service: 'gmail',
      debug: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    })
    this.from = process.env.ADMIN_EMAIL || ''
    this.frontendHost = process.env.BASE_URL || ''
  }

  private async _createNodeMailerTransport() {
    return nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      service: 'gmail',
      debug: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  async sendMailCode(email: string, code: string) {
    const message = {
      from: "doctor247app@gmail.com",
      to: email,
      subject: "Register Account code",
      // text: null,
      html: `<p>Your code to register Doctor247 account is: <b>${code}</b></p>`
    };
    const mailOptions: nodemailer.SendMailOptions = { ...message }
    const transporter = await this._createNodeMailerTransport()

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('Message sent: ' + info.response);
      }
    });
  }


  async sendMailDeleteGuardian(email: string, code: string) {
    const message = {
      from: "doctor247app@gmail.com",
      to: email,
      subject: "Delete guardian code",
      // text: null,
      html: `<p>Your code to delete guardian is: <b>${code}</b></p>`
    };
    const mailOptions: nodemailer.SendMailOptions = { ...message }
    const transporter = await this._createNodeMailerTransport()

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('Message sent: ' + info.response);
      }
    });
  }


  async sendMailChangePassword(email: string, code: string) {
    const message = {
      from: "doctor247app@gmail.com",
      to: email,
      subject: "Change password Doctor247'account",
      // text: null,
      html: `<p>Your code to change password is: <b>${code}</b></p>`
    };
    const mailOptions: nodemailer.SendMailOptions = { ...message }
    const transporter = await this._createNodeMailerTransport()

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('Message sent: ' + info.response);
      }
    });
  }

  async sendMailAddEmail(email: string, code: string) {
    const message = {
      from: "doctor247app@gmail.com",
      to: email,
      subject: "Add phone number Doctor247'account",
      // text: null,
      html: `<p>Your code to add this email to Doctor247 account is: <b>${code}</b></p>`
    };
    const mailOptions: nodemailer.SendMailOptions = { ...message }
    const transporter = await this._createNodeMailerTransport()

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('Message sent: ' + info.response);
      }
    });
  }

  async sendMailInitUserGuardian(email: string, code: string) {
    const message = {
      from: "doctor247app@gmail.com",
      to: email,
      subject: "Add phone number Doctor247'account",
      // text: null,
      html: `<p>Your code to create account your guardian is: <b>${code}</b></p>`
    };
    const mailOptions: nodemailer.SendMailOptions = { ...message }
    const transporter = await this._createNodeMailerTransport()

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('Message sent: ' + info.response);
      }
    });
  }

}
