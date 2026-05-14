const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // Use TLS
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// Function to notify employee about leave status
// const sendLeaveNotification = async (email, name, status) => {
//     try {
//         const subject = `Leave Request ${status}`;
//         const message = `Hello ${name},\n\nYour leave request has been ${status.toLowerCase()}.\n\nRegards,\nAdmin Team`;

//         await transporter.sendMail({
//             from: `"Admin Team" <${process.env.GMAIL_USER}>`,
//             to: email,
//             subject: subject,
//             text: message,
//         });

//         console.log(`Notification email sent to ${email}`);
//     } catch (error) {
//         console.error("Error sending email:", error);
//     }
// };

// Function to notify employee about leave status
const sendLeaveNotification = async (leaveRequest) => {
    try {
        if (!leaveRequest || !leaveRequest.status) {
            throw new Error("Invalid leave request: Missing status field.");
        }

        const statusText = leaveRequest.status ? leaveRequest.status.toLowerCase() : "pending"; // Default to "pending"

        const subject = `Leave Request ${leaveRequest.status}`;
        const message = `
        <p>Hello <strong>${leaveRequest.name}</strong>,</p>
        <p>Your leave request has been <strong>${leaveRequest.status.toLowerCase()}</strong>.</p>

        <h3>Leave Request Details:</h3>
        <ul>
            <li><strong>Name:</strong> ${leaveRequest.name}</li>
            <li><strong>Email:</strong> ${leaveRequest.email}</li>
            <li><strong>Designation:</strong> ${leaveRequest.designation}</li>
            <li><strong>Leave Type:</strong> ${leaveRequest.leaveType}</li>
            <li><strong>Start Date:</strong> ${new Date(leaveRequest.startDate).toLocaleDateString("en-GB")}</li>
            <li><strong>End Date:</strong> ${new Date(leaveRequest.endDate).toLocaleDateString("en-GB")}</li>
            <li><strong>Total Leave Days:</strong> ${leaveRequest.totalLeaveDays}</li>
            <li><strong>Reason:</strong> ${leaveRequest.reason}</li>
            <li><strong>Status:</strong> ${leaveRequest.status}</li>
        </ul>

        <p>Regards,<br>Admin Team</p>
        `;

        // Email disabled for local development
        console.log(`Email disabled: Would send leave notification to ${leaveRequest.email}`);
        // await transporter.sendMail({
        //     from: `"Admin Team" <${process.env.GMAIL_USER}>`,
        //     to: leaveRequest.email,
        //     subject: subject,
        //     html: message, // Using HTML instead of plain text
        // });

        console.log(`Notification email sent to ${leaveRequest.email}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};


// const sendLeaveNotificationToAdmin = async (leaveRequest) => {
//     try {
//         const subject = `New Leave Request from ${leaveRequest.name}`;
//         const message = `A new leave request has been submitted by ${leaveRequest.name}.\n\n
// Reason: ${leaveRequest.reason}\n\n
// Login to review the request.`;

//         await transporter.sendMail({
//             from: `"Leave System" <${process.env.GMAIL_USER}>`,
//             to: process.env.ADMIN_EMAIL, // Admin email from .env
//             subject: subject, // Unique subject to avoid Gmail grouping
//             text: message,
//         });

//         console.log(`Notification email sent to Admin at ${process.env.ADMIN_EMAIL}`);
//     } catch (error) {
//         console.error("Error sending email to admin:", error);
//     }
// };

// Function to notify admin about new leave request
const sendLeaveNotificationToAdmin = async (leaveRequest) => {
    try {
        const subject = `New Leave Request from ${leaveRequest.name}`;
        const message = `
        <p>A new leave request has been submitted.</p>

        <h3>Employee Details:</h3>
        <ul>
            <li><strong>Name:</strong> ${leaveRequest.name}</li>
            <li><strong>Email:</strong> ${leaveRequest.email}</li>
            <li><strong>Designation:</strong> ${leaveRequest.designation}</li>
        </ul>

        <h3>Leave Request Details:</h3>
        <ul>
            <li><strong>Leave Type:</strong> ${leaveRequest.leaveType}</li>
            <li><strong>Start Date:</strong> ${new Date(leaveRequest.startDate).toLocaleDateString("en-GB")}</li>
            <li><strong>End Date:</strong> ${new Date(leaveRequest.endDate).toLocaleDateString("en-GB")}</li>
            <li><strong>Total Leave Days:</strong> ${leaveRequest.totalLeaveDays}</li>
            <li><strong>Reason:</strong> ${leaveRequest.reason}</li>
           
        </ul>

        <p>Login to the system to review and take action.</p>


        <p>
         <a href="https://192.168.1.150:5176/" target="_blank" style="color: #1a73e8;">
              🔗 Go to Armtronix Employee-Admin Portal
          </a>
        </p>

        <p>Regards,<br>${leaveRequest.name}</p>
        `;
       
        const adminEmails = process.env.ADMIN_EMAILS.split(",");

        // Email disabled for local development
        console.log(`Email disabled: Would send leave notification to admins: ${adminEmails.join(", ")}`);
        // await transporter.sendMail({
        //     from: `"Leave Application by ${leaveRequest.name}" <${process.env.GMAIL_USER}>`,
        //     to: adminEmails, // <-- array of emails
        //     subject: subject,
        //     html: message,
        // });

        console.log(`Notification email sent to Admins at: ${adminEmails.join(", ")}`);
    } catch (error) {
        console.error("Error sending email to admin:", error);
    }
};

const sendClaimNotificationToAdmin = async (claimData) => {
    try {
        const subject = `🧾 New Claim Submitted: ${claimData.claimNumber}`;
        const message = `
        <h2>New Expense Claim Submitted</h2>
        <p><strong>Employee Name:</strong> ${claimData.employeeName}</p>
        <p><strong>Claim Number:</strong> ${claimData.claimNumber}</p>
        <p><strong>Date:</strong> ${claimData.date}</p>
        <p><strong>Total Expense:</strong> ₹${claimData.totalExpense?.toFixed(2)}</p>
        <p><strong>Location:</strong> ${claimData.location || 'N/A'}</p>

        <h3>Expenses:</h3>
        <ul>
            ${claimData.expenses.map(exp => `
              <li>
                <strong>Purpose:</strong> ${exp.purpose} |
                <strong>Qty:</strong> ${exp.quantity} |
                <strong>Unit Price:</strong> ₹${exp.unitPrice} |
                <strong>Amount:</strong> ₹${exp.amount}
              </li>
            `).join('')}
        </ul>

        <p>Login to the portal to view full details and process the payment.</p>
        
        <p>
          <a href="https://192.168.1.220:5176/" target="_blank" style="color: #1a73e8;">
              🔗 Go to Armtronix Employee-Admin Portal
          </a>
        </p>

                <p>Regards,<br>${claimData.employeeName}</p>

        `;

        // Email disabled for local development
        console.log("Email disabled: Would send claim notification to admin.");
        // await transporter.sendMail({
        //     from: `"Expense Claim System" <${process.env.GMAIL_USER}>`,
        //     to: process.env.ADMIN_EMAILS.split(","), // multiple admins
        //     subject,
        //     html: message
        // });

        console.log("✅ Claim submission email sent to admin.");
    } catch (error) {
        console.error("❌ Error sending claim notification email:", error);
    }
};

module.exports = {
    sendLeaveNotification,
    sendLeaveNotificationToAdmin,
    sendClaimNotificationToAdmin // <-- ✅ Export it
};


// module.exports = { sendLeaveNotification, sendLeaveNotificationToAdmin };


