'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// ********************************************************************
// *        Mail Notification on Contact Form Submission
// ********************************************************************

const nodemailer = require('nodemailer');

//to make it work you need gmail account
const gmailEmail = functions.config().gmail.login;
const gmailPassword = functions.config().gmail.pass;

admin.initializeApp();

//creating function for sending emails
var goMail = function (formData) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailEmail,
            pass: gmailPassword,
        },
    });

    // Preparing contact notification mail to dev
    const devMessageText = `From: ${formData.name}\nMail: ${formData.email}\n\nMessage:\n${formData.text}`;
    const devHtmlMessageText = devMessageText.split('\n').join('<br>');
    const devMailOptions = {
        from: gmailEmail, // sender address
        to: 'maximilian.joas@nait.app', // 'maximilian.joas@nait.app', // list of receivers
        subject: 'Neue Kontaktanfrage an NAITdev', // Subject line
        text: devMessageText, // plain text body
        html: devHtmlMessageText, // html body
    };

    // Preparing confirmation mail to customer
    const customerMessageText = `Hallo ${formData.name},\n\nVielen Dank für deine Kontaktanfrage! Wir melden uns so schnell wie möglich unter dieser Emailadresse zurück.\n\nMit freundlichen Grüßen,\ndas NAITdev-Team \n\n\nDeine Kontaktanfrage:\n${formData.text}`;
    const customerHtmlMessageText = customerMessageText
        .split('\n')
        .join('<br>');
    const customerMailOptions = {
        from: gmailEmail, // sender address
        to: formData.email, // 'maximilian.joas@nait.app', // list of receivers
        subject: 'Deine Kontaktanfrage an NAITdev', // Subject line
        text: customerMessageText, // plain text body
        html: customerHtmlMessageText, // html body
    };

    //this is callback function to return status to firebase console
    const getCustomerDeliveryStatus = function (error, info) {
        if (error) {
            return console.log(error);
        }
        return console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    };

    //this is callback function to return status to firebase console
    const getDevDeliveryStatus = function (error, info) {
        if (error) {
            return console.log(error);
        }
        return console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    };

    //call of this function send an email, and return status
    transporter.sendMail(devMailOptions, getDevDeliveryStatus);
    transporter.sendMail(customerMailOptions, getCustomerDeliveryStatus);
};

//.onDataAdded is watches for changes in database
exports.onDataAdded = functions.database
    .ref('/emails/{sessionId}')
    .onCreate((snap, context) => {
        //here we catch a new data, added to firebase database, it stored in a snap variable
        const formData = snap.val();

        //here we send new data using function for sending emails
        goMail(formData);
    });

// ********************************************************************
// *        reCAPTCHA Handling
// ********************************************************************

const rp = require('request-promise');
const sanitizeHtml = require('sanitize-html');

exports.checkRecaptcha = functions.https.onRequest((req, res) => {
    const response = sanitizeHtml(req.body.resp);
    // console.log('recaptcha response', response);
    // const message = req.body.msg.message;
    const message = req.body.msg;
    // console.log('message', message);

    rp({
        uri: 'https://recaptcha.google.com/recaptcha/api/siteverify',
        method: 'POST',
        formData: {
            secret: functions.config().recaptcha.key,
            response: response,
        },
        json: true,
    })
        .then((result) => {
            if (result.success) {
                console.log('recaptcha success');
                if (!admin.apps.length) {
                    admin.initializeApp(functions.config().firebase);
                }

                // sanitizing contact form message
                var sanitizedMessage = {};
                for (var key in message) {
                    sanitizedMessage[key] = sanitizeHtml(message[key]);
                }
                admin.database().ref('emails').push().set(sanitizedMessage);
                console.log('I could make changes to the database');
                return null;
            } else {
                console.log('recaptcha failed');
                res.send('Recaptcha verification failed. Are you a robot?');
                return null;
            }
        })
        .catch((reason) => {
            console.log('Technical recaptcha request failure', reason);
            // res.send('Recaptcha request failed.');
        })
        .then(() => {
            console.log('I reached the redirect bit.');
            res.status(200).send('Successfully sent request.');
            return null;
        })

        .catch((error) => {
            res.status(500).send(error);
            return null;
        });
    return null;
});
