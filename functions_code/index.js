/**
 * Firebase Cloud Functions v2 for Automatic Email Sending
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");

initializeApp();
const db = getFirestore();

// Gmail credentials from environment
const gmailEmail = process.env.GMAIL_EMAIL || "aryangoel299@gmail.com";
const gmailPassword = process.env.GMAIL_PASSWORD || "";

function createTransporter() {
    if (!gmailPassword) {
        console.error("No Gmail password set");
        return null;
    }
    return nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailEmail, pass: gmailPassword },
    });
}

// Demo signup trigger
exports.onDemoSignupCreated = onDocumentCreated("demoSignups/{signupId}", async (event) => {
    const data = event.data.data();
    console.log("New demo signup:", data.email);

    const transporter = createTransporter();
    if (!transporter) return;

    const mailOptions = {
        from: "Techspert <" + gmailEmail + ">",
        to: data.email,
        subject: "Welcome! Your Free Demo Session - Techspert",
        html: "<div style=\"font-family:Arial;max-width:600px\">" +
            "<h2 style=\"color:#10b981\">Registration Successful!</h2>" +
            "<p>Dear <b>" + data.name + "</b>,</p>" +
            "<p>Thank you for registering!</p>" +
            "<p><b>Course:</b> " + (data.courseName || "Demo") + "</p>" +
            "<p><b>Day:</b> Every Saturday, 2-3 PM IST</p>" +
            (data.demoLink ? "<p><a href=\"" + data.demoLink + "\">Join Demo</a></p>" : "") +
            "<p>Best regards,<br><b>Techspert Team</b></p></div>",
    };

    try {
        await transporter.sendMail(mailOptions);
        await event.data.ref.update({ emailSent: true });
        console.log("Email sent to:", data.email);
    } catch (error) {
        console.error("Email error:", error);
    }
});

// Enquiry trigger
exports.onEnquiryCreated = onDocumentCreated("enquiries/{enquiryId}", async (event) => {
    const data = event.data.data();
    console.log("New enquiry:", data.email);

    const transporter = createTransporter();
    if (!transporter) return;

    const mailOptions = {
        from: "Techspert <" + gmailEmail + ">",
        to: data.email,
        subject: "Thank you for your enquiry - Techspert",
        html: "<div style=\"font-family:Arial;max-width:600px\">" +
            "<h2 style=\"color:#3b82f6\">Thank You!</h2>" +
            "<p>Dear <b>" + data.name + "</b>,</p>" +
            "<p>We received your enquiry and will respond soon.</p>" +
            "<p><b>Subject:</b> " + (data.subject || "General") + "</p>" +
            "<p>Best regards,<br><b>Techspert Team</b></p></div>",
    };

    try {
        await transporter.sendMail(mailOptions);
        await event.data.ref.update({ autoResponseSent: true });
        console.log("Email sent to:", data.email);
    } catch (error) {
        console.error("Email error:", error);
    }
});
