require("dotenv").config({ path: "config.env" });
const { Resend } = require("resend");
// const messaging = require("./firebaseAdmin");
const { adminEmailList } = require("../tools/constants");
const { log_notifyError } = require("../tools/helper");

const resendKey = process.env.RESEND_API;
const resend = new Resend(resendKey);

/**
 * Send a notification to a single device token.
 * @param {string} token - Single device token.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 * @param {object} data - Additional custom data (optional).
 */
const sendNotificationToSingleDevice = async (
  token,
  title,
  body,
  data = {}
) => {
  try {
    const message = {
      notification: { title: title, body: body },
      data,
      token,
    };

    // const response = await messaging.send(message);

    return response;
  } catch (err) {
    console.error("Error sending notification:", err);
    throw err;
  }
};

/**
 * Send a notification to multiple device tokens.
 * @param {string[]} tokens - Array of device tokens.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 * @param {object} data - Additional custom data (optional).
 */
const sendNotificationToMultiDevice = async (
  tokens,
  title,
  body,
  data = {}
) => {
  try {
    const responses = await Promise.all(
      tokens.map((token) => {
        const message = {
          token,
          notification: { title, body },
          data: data,
        };
        // return messaging.send(message);
      })
    );

    const invalidTokens = responses
      .map((response, i) => (response?.success ? null : tokens[i]))
      .filter((tk) => tk !== null);

    return responses;
  } catch (err) {
    console.error("Error sending notification:", err);
    throw err;
  }
};

const sendAdminEmail = async (eventData) => {
  try {
    const { subject, body } = eventData;

    const sendPromises = adminEmailList?.map(
      async (email) =>
        await resend.emails.send({
          from: "Womaye Requests <requests@womaye.com>",
          to: email,
          subject,
          html: `<!doctype html><html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #4CAF50;
              color: white;
              text-align: center;
              padding: 10px;
              border-radius: 8px 8px 0 0;
            }
            .content {
              margin-top: 20px;
            }
            .content p {
              font-size: 16px;
              line-height: 1.6;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #888;
            }
            .important {
              color: #4CAF50;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Service Request</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have a new request! Please find the details below:</p>
              <p><strong>[REQUEST FOR]</strong> <span class="important">${
                body.service
              }</span></p>
              <p><strong>[WANTS IT ON]</strong> <span class="important">${format(
                new Date(body.date),
                "MMMM dd, yyyy"
              )}</span></p>
              <p>Don't miss out on this opportunity to provide your service!</p>
            </div>
            <div class="footer">
              <p>Thank you for using our platform!</p>
              <p>For any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>`,
        })
    );

    await Promise.all(sendPromises);
  } catch (error) {
    log_notifyError(`"Failed to send email:", ${error}`);
  }
};

const sendPermitEmail = async (eventData, email) => {
  try {
    const { subject, body } = eventData;

    // Email content
    await resend.emails.send({
      from: "Womaye Permit <permission@womaye.com>",
      to: email,
      subject,
      html: `<!doctype html><html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #4CAF50;
            color: white;
            text-align: center;
            padding: 10px;
            border-radius: 8px 8px 0 0;
          }
          .content {
            margin-top: 20px;
          }
          .content p {
            font-size: 16px;
            line-height: 1.6;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #888;
          }
          .important {
            color: #4CAF50;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Permission Request</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have a new request for permission! Please find the details below:</p>
            <p><strong>[Access Key]</strong> <span class="important">${body.key}</span></p>
           
          </div>
          <div class="footer">
            <p>Thank you for using our platform!</p>
            <p>For any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
    </html>`,
    });
  } catch (error) {
    log_notifyError(`"Failed to send email:", ${error}`);
    return { error: "Failed to send email" };
  }
};

const sendGSEmail = async (eventData) => {
  try {
    const { subject, body, to } = eventData;

    // Configure transporter with your email credentials

    // Email content
    const mailOptions = {
      from: authUser,
      to,
      subject: subject,
      text: body,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

const sendAdminSMS = async (message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.ADMIN_CONTACT,
    });
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
};

module.exports = {
  sendNotificationToSingleDevice,
  sendNotificationToMultiDevice,
  sendAdminEmail,
  sendAdminSMS,
  sendPermitEmail,
};

// Email Body Text Format 1

// <!doctype html>
// <html>
//   <head>
//     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//     <style>
//       body {
//         font-family: "Poppins", Segoe UI, Roboto, Ubuntu, sans-serif;
//         display: flex;
//         justify-content: center;
//         padding: 1rem 0rem;
//       }
//       p {
//         padding: 0rem;
//         margin: 0rem;
//       }
//       .main {
//         font-size: 1.3rem;
//         background-color: #F4F3EF;
//         color: black;
//         width: 80%;
//         border-radius: 7px;
//         padding: 2rem 0rem;
//       }
//       .intro {
//         height: fit-content;
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//         align-items: center;
//       }
//       .logoBox {
//         width: 100%;
//         height: 5rem;
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: center;
//       }
//       .wLogo {
//         width: 2rem;
//         height: 2rem;
//         margin: 0rem;
//       }
//       .logoText {
//         margin: 0rem;
//         font-size: 1.5rem;
//         font-weight: 600;
//         text-transform: uppercase;
//          color: var(--coffee-dim-700);
//          @supports (background-clip: text) {
//            background-image: linear-gradient(90deg, #ab5121 10%, #f5b759 30%, #d77307 100%);
//            background-clip: text;
//            color: transparent;`
//           }
//       }
//       .head1 {
//         font-size: 1rem;
//         font-weight: 600;
//         padding: 0.5rem 0rem;
//         text-transform: capitalize;
//         height: fit-content;
//         margin: 0rem;
//       }
//       .head2 {
//         font-size: 1.3rem;
//         font-weight: 700;
//         text-align: center;
//         width: 100%;
//       }
//       .text {
//         font-size: 1rem;
//         padding: 0.5rem 0rem;
//         text-align: center;
//         width: 100%;
//       }
//       .content {
//         width: 100%;
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//         align-items: center;
//         height:fit-content;
//         padding: 2rem 0rem 0.5rem 0rem;
//       }
//       .cText {
//         width: 70%;
//         text-align: left;
//         margin-top: 1rem;
//       }
//       .wImg {
//         width: 70%;
//         height: 15rem;
//         border-radius: 7px;
//       }
//       .btn {
//         font-size: 1.2rem;
//         background-color: #0369a1;
//         color: #fff;
//         width: fit-content;
//         height: fit-content;
//         border-radius: 7px;
//         text-decoration: none;
//         padding: 0.5rem 1rem;
//         text-align: center;
//         margin-top: 1rem;
//       }
//       @media screen and (min-width: ${"310px"}) {
//         body {
//           min-width: 310px;
//           height: fit-content;
//         }
//         .main {
//           background-color: black;
//           color: white;
//         }
//       }
//       @media screen and (min-width: ${"760px"}) {
//         body {
//           width: 760px;
//           height: fit-content;
//         }
//         .main {
//           background-color: #F4F3EF;
//           color: black;
//         }
//       }
//     </style>
//   </head>
//   <body>
//   </body>
// </html>
