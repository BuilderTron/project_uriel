import {onRequest} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import * as nodemailer from "nodemailer";

// Initialize Firebase Admin SDK
initializeApp();

// Email configuration for contact form
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Cloud Function to send contact form emails
 * Triggered when a new document is created in the 'messages' collection
 */
export const sendContactEmail = onRequest({cors: true}, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    const {name, email, subject, message} = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      res.status(400).send("Missing required fields");
      return;
    }

    // Store in Firestore
    const db = getFirestore();
    const messageDoc = await db.collection("messages").add({
      name,
      email,
      subject: subject || "Contact Form Message",
      message,
      status: "unread",
      createdAt: new Date(),
    });

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Message: ${subject || "No Subject"}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "No subject"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><em>Message ID: ${messageDoc.id}</em></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      messageId: messageDoc.id,
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
});

/**
 * NEW Cloud Function with different name to fix CORS caching issues
 */
export const submitContactForm = onRequest({cors: true}, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    const {name, email, subject, message} = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      res.status(400).send("Missing required fields");
      return;
    }

    // Store in Firestore
    const db = getFirestore();
    const messageDoc = await db.collection("messages").add({
      name,
      email,
      subject: subject || "Contact Form Message",
      message,
      status: "unread",
      createdAt: new Date(),
    });

    // Send email notification (skip if no email config)
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || "admin@example.com",
        subject: `New Contact Form Message: ${subject || "No Subject"}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "No subject"}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <hr>
          <p><em>Message ID: ${messageDoc.id}</em></p>
        `,
      };

      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        await transporter.sendMail(mailOptions);
      }
    } catch (emailError) {
      console.log("Email not sent (configuration missing):", emailError);
      // Continue without email - form submission still works
    }

    res.status(200).json({
      success: true,
      messageId: messageDoc.id,
      message: "Form submitted successfully"
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process form submission",
    });
  }
});

/**
 * Health check endpoint
 */
export const healthCheck = onRequest(async (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    project: "project-uriel",
  });
});