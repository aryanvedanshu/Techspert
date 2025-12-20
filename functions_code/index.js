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

/**
 * Razorpay Payment Webhook Handler
 * 
 * NOTE: This is a placeholder structure. To activate:
 * 1. Install crypto: npm install crypto
 * 2. Add RAZORPAY_KEY_SECRET to Firebase environment
 * 3. Configure webhook URL in Razorpay Dashboard
 */
const { onRequest } = require("firebase-functions/v2/https");
// const crypto = require("crypto"); // Uncomment when activating

// Generate random password for enrolled students
function generatePassword(length = 10) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Razorpay webhook endpoint
exports.razorpayWebhook = onRequest({ cors: true }, async (req, res) => {
    // Only accept POST requests
    if (req.method !== "POST") {
        return res.status(405).send("Method not allowed");
    }

    console.log("Razorpay webhook received");

    try {
        const webhookBody = req.body;
        const webhookSignature = req.headers["x-razorpay-signature"];
        const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!razorpaySecret) {
            console.error("RAZORPAY_KEY_SECRET not configured");
            return res.status(500).send("Webhook secret not configured");
        }

        // TODO: Verify webhook signature (uncomment when crypto is installed)
        /*
        const expectedSignature = crypto
            .createHmac("sha256", razorpaySecret)
            .update(JSON.stringify(webhookBody))
            .digest("hex");

        if (expectedSignature !== webhookSignature) {
            console.error("Invalid webhook signature");
            return res.status(400).send("Invalid signature");
        }
        */

        // Process payment.captured event
        if (webhookBody.event === "payment.captured") {
            const payment = webhookBody.payload.payment.entity;
            console.log("Payment captured:", payment.id);

            // Extract payment details
            const paymentData = {
                razorpayPaymentId: payment.id,
                razorpayOrderId: payment.order_id || null,
                amount: payment.amount / 100, // Convert paise to rupees
                currency: payment.currency,
                email: payment.email,
                phone: payment.contact,
                method: payment.method,
                status: "captured",
                createdAt: new Date(),
                generatedPassword: generatePassword(),
                credentialsSent: false,
            };

            // Save to crm_payments collection
            const paymentRef = await db.collection("crm_payments").add(paymentData);
            console.log("Payment saved:", paymentRef.id);

            // Send enrollment confirmation email with credentials
            const transporter = createTransporter();
            if (transporter) {
                const mailOptions = {
                    from: "Techspert <" + gmailEmail + ">",
                    to: payment.email,
                    subject: "🎉 Enrollment Successful - Your Login Credentials",
                    html: `
                        <div style="font-family:Arial;max-width:600px">
                            <h2 style="color:#10b981">Payment Successful!</h2>
                            <p>Dear Student,</p>
                            <p>Thank you for enrolling! Your payment of <b>₹${paymentData.amount.toLocaleString()}</b> has been received.</p>
                            
                            <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0">
                                <h3 style="margin-top:0">Your Login Credentials</h3>
                                <p><b>Email:</b> ${payment.email}</p>
                                <p><b>Password:</b> ${paymentData.generatedPassword}</p>
                            </div>
                            
                            <p><b>Payment ID:</b> ${payment.id}</p>
                            
                            <p>Please save these credentials securely. You can change your password after logging in.</p>
                            
                            <p>Best regards,<br><b>Techspert Team</b></p>
                        </div>
                    `,
                };

                try {
                    await transporter.sendMail(mailOptions);
                    await db.collection("crm_payments").doc(paymentRef.id).update({
                        credentialsSent: true,
                        credentialsSentAt: new Date(),
                    });
                    console.log("Credentials email sent to:", payment.email);
                } catch (emailError) {
                    console.error("Failed to send credentials email:", emailError);
                }
            }

            return res.status(200).send("Payment processed");
        }

        // Handle other events (refunds, failures, etc.)
        console.log("Unhandled event:", webhookBody.event);
        return res.status(200).send("Event received");

    } catch (error) {
        console.error("Webhook error:", error);
        return res.status(500).send("Webhook processing failed");
    }
});

// Payment confirmation trigger (when payment is added via client)
exports.onPaymentCreated = onDocumentCreated("crm_payments/{paymentId}", async (event) => {
    const data = event.data.data();

    // Skip if already handled by webhook
    if (data.credentialsSent) return;

    console.log("New payment record:", event.params.paymentId);

    // Generate password if not present
    if (!data.generatedPassword) {
        const password = generatePassword();
        await event.data.ref.update({ generatedPassword: password });
        data.generatedPassword = password;
    }

    // Send credentials email
    const transporter = createTransporter();
    if (!transporter || !data.email) return;

    const mailOptions = {
        from: "Techspert <" + gmailEmail + ">",
        to: data.email,
        subject: "🎉 Enrollment Successful - Your Login Credentials",
        html: `
            <div style="font-family:Arial;max-width:600px">
                <h2 style="color:#10b981">Welcome to Techspert!</h2>
                <p>Dear ${data.name || "Student"},</p>
                <p>Your enrollment for <b>${data.courseName || "the course"}</b> is confirmed!</p>
                
                <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0">
                    <h3 style="margin-top:0">Your Login Credentials</h3>
                    <p><b>Email:</b> ${data.email}</p>
                    <p><b>Password:</b> ${data.generatedPassword}</p>
                </div>
                
                <p>Amount Paid: <b>₹${(data.amount || 0).toLocaleString()}</b></p>
                
                <p>Best regards,<br><b>Techspert Team</b></p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        await event.data.ref.update({ credentialsSent: true, credentialsSentAt: new Date() });
        console.log("Credentials sent to:", data.email);
    } catch (error) {
        console.error("Email error:", error);
    }
});
