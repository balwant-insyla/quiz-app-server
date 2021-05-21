const sgMail = require('@sendgrid/mail')

//sgMail.sendGridAPI(sendGridAPI)
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail =  (email, name) =>{
    sgMail.send({
        to: email,
        from: 'balwant.mnd@gmail.com',
        subject: 'Thanks for Joining in !',
        text: `Welcome to the app, ${ name }. Let me know how you get along with the app.`
        
    })
}

const sendDeleteEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'balwant.mnd@gmail.com',
        subject: 'sorry to see you go',
        text: `Goodbye ${name}. I hope to see you back sometime soon.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail
}