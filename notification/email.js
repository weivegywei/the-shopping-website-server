import { transporter } from '../server'

export const sendEmail = (receivers, title, textMessage, htmlBody ) => transporter.sendMail({
    from: '"My Wei Shop" <myweishopofficial000@gmail.com>', // sender address
    to: `${receivers}, myweishopofficial000@gmail.com`, // list of receivers: string
    subject: `${title}`, // Subject line: string
    text: `${textMessage} Thank you for shopping with us!`, // plain text body: string
    html: `<b>${htmlBody}</b><br /> Thank you for shopping with us!`, // html body
  }).then(info => {
    console.log({info});
  }).catch(console.error);
