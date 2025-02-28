const nodeMailer = require("nodemailer");

const sendMail = async (options)=>{
 
const transporter = await nodeMailer.createTransport({
    service:"gmail",

  secure: true, // true for port 465, false for other ports
  auth: {
    user: "etijoroemmanuel1@gmail.com",
    pass: "jzxnlmavujgxcjcx"
  },
  tls:{
    rejectUnauthorized: false,
  }
});
const mailOption = {
    subject:options.subject, text:options.text, from:"etijoroemmanuel1@gmail.com", to: options.email, html:options.html
}
await transporter.sendMail(mailOption)

}
module.exports = sendMail