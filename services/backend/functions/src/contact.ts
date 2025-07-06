import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sgMail from "@sendgrid/mail";

const db = admin.firestore();

// Configure SendGrid (API key should be set in environment variables)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: admin.firestore.FieldValue;
  read: boolean;
  priority: "low" | "normal" | "high";
}

export const contactForm = functions.https.onCall(async (data, context) => {
  try {
    // Validate required fields
    const {name, email, subject, message} = data;
    
    if (!name || !email || !subject || !message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: name, email, subject, message"
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid email format"
      );
    }

    // Create message document
    const messageData: ContactMessage = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      priority: "normal",
    };

    // Save to Firestore
    const docRef = await db.collection("messages").add(messageData);

    // Send email notification to admin (if configured)
    if (process.env.SENDGRID_API_KEY && process.env.ADMIN_EMAIL) {
      const emailContent = {
        to: process.env.ADMIN_EMAIL,
        from: process.env.FROM_EMAIL || "noreply@projecturiel.com",
        subject: `New Contact Form Message: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
          <p><strong>Message ID:</strong> ${docRef.id}</p>
        `,
      };

      await sgMail.send(emailContent);
    }

    return {
      success: true,
      messageId: docRef.id,
      message: "Thank you for your message! I'll get back to you soon.",
    };
  } catch (error) {
    console.error("Error processing contact form:", error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing your message. Please try again."
    );
  }
});