/**
 * Email templates for booking notifications
 * Uses simple HTML for maximum email client compatibility
 */

interface BookingEmailData {
  customerName: string;
  professionalName: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: string;
  address: string;
  bookingId: string;
  amount?: string;
}

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .container {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .header {
    background-color: #2563eb;
    color: white;
    padding: 20px;
    border-radius: 8px 8px 0 0;
    text-align: center;
  }
  .content {
    padding: 20px;
  }
  .booking-details {
    background-color: #f9fafb;
    padding: 15px;
    border-radius: 6px;
    margin: 20px 0;
  }
  .booking-details p {
    margin: 8px 0;
  }
  .label {
    font-weight: 600;
    color: #6b7280;
  }
  .button {
    display: inline-block;
    background-color: #2563eb;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 6px;
    margin: 10px 5px;
  }
  .button-secondary {
    background-color: #6b7280;
  }
  .footer {
    text-align: center;
    color: #6b7280;
    font-size: 14px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }
`;

export function newBookingRequestEmail(data: BookingEmailData, dashboardUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Booking Request</h1>
        </div>
        <div class="content">
          <p>Hi ${data.professionalName},</p>
          <p>You have a new booking request from <strong>${data.customerName}</strong>!</p>

          <div class="booking-details">
            <p><span class="label">Service:</span> ${data.serviceName}</p>
            <p><span class="label">Date:</span> ${data.scheduledDate}</p>
            <p><span class="label">Time:</span> ${data.scheduledTime}</p>
            <p><span class="label">Duration:</span> ${data.duration}</p>
            <p><span class="label">Location:</span> ${data.address}</p>
            ${data.amount ? `<p><span class="label">Amount:</span> ${data.amount}</p>` : ''}
          </div>

          <p><strong>⏰ Please respond within 24 hours</strong> or this booking will be automatically declined.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="button">View Booking Request</a>
          </div>

          <p>You can accept or decline this booking from your dashboard.</p>
        </div>
        <div class="footer">
          <p>MaidConnect - Connecting you with trusted service</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function bookingConfirmedEmailForCustomer(data: BookingEmailData, dashboardUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Great news! <strong>${data.professionalName}</strong> has confirmed your booking.</p>

          <div class="booking-details">
            <p><span class="label">Service:</span> ${data.serviceName}</p>
            <p><span class="label">Date:</span> ${data.scheduledDate}</p>
            <p><span class="label">Time:</span> ${data.scheduledTime}</p>
            <p><span class="label">Duration:</span> ${data.duration}</p>
            <p><span class="label">Location:</span> ${data.address}</p>
            ${data.amount ? `<p><span class="label">Amount:</span> ${data.amount}</p>` : ''}
          </div>

          <p>Your payment has been authorized and will be charged after the service is completed.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="button">View Booking Details</a>
          </div>

          <p><strong>What's next?</strong></p>
          <ul>
            <li>You'll receive a reminder 24 hours before your service</li>
            <li>Your professional will check in when they arrive</li>
            <li>After service completion, you can rate your experience</li>
          </ul>
        </div>
        <div class="footer">
          <p>MaidConnect - Connecting you with trusted service</p>
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function bookingDeclinedEmailForCustomer(data: BookingEmailData, reason?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #6b7280;">
          <h1>Booking Declined</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Unfortunately, <strong>${data.professionalName}</strong> was unable to accept your booking request.</p>

          <div class="booking-details">
            <p><span class="label">Service:</span> ${data.serviceName}</p>
            <p><span class="label">Date:</span> ${data.scheduledDate}</p>
            <p><span class="label">Time:</span> ${data.scheduledTime}</p>
            ${reason ? `<p><span class="label">Reason:</span> ${reason}</p>` : ''}
          </div>

          <p><strong>Your payment authorization has been voided.</strong> No charges will be made to your account.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="/professionals" class="button">Find Another Professional</a>
          </div>

          <p>We have many other qualified professionals available. Browse our directory to find your perfect match!</p>
        </div>
        <div class="footer">
          <p>MaidConnect - Connecting you with trusted service</p>
          <p>Need help finding a professional? Contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function bookingReminderEmail(data: BookingEmailData, isForProfessional: boolean): string {
  const recipientName = isForProfessional ? data.professionalName : data.customerName;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #f59e0b;">
          <h1>Reminder: Upcoming Service</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName},</p>
          <p><strong>Reminder:</strong> You have a service scheduled for tomorrow!</p>

          <div class="booking-details">
            <p><span class="label">Service:</span> ${data.serviceName}</p>
            <p><span class="label">Date:</span> ${data.scheduledDate}</p>
            <p><span class="label">Time:</span> ${data.scheduledTime}</p>
            <p><span class="label">Duration:</span> ${data.duration}</p>
            <p><span class="label">Location:</span> ${data.address}</p>
          </div>

          ${isForProfessional
            ? '<p><strong>Don\'t forget to:</strong></p><ul><li>Confirm you have the address and any special instructions</li><li>Bring all necessary supplies</li><li>Check in when you arrive using the app</li></ul>'
            : '<p><strong>Please ensure:</strong></p><ul><li>Someone is home at the scheduled time</li><li>The property is accessible</li><li>Any special instructions have been communicated</li></ul>'
          }
        </div>
        <div class="footer">
          <p>MaidConnect - Connecting you with trusted service</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function messageNotificationEmail(
  recipientName: string,
  senderName: string,
  messagePreview: string,
  bookingId: string,
  dashboardUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Message</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName},</p>
          <p>You have a new message from <strong>${senderName}</strong>:</p>

          <div class="booking-details">
            <p style="font-style: italic;">"${messagePreview}"</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="button">View Message</a>
          </div>
        </div>
        <div class="footer">
          <p>MaidConnect - Connecting you with trusted service</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function serviceCompletedEmail(data: BookingEmailData, isForProfessional: boolean): string {
  const recipientName = isForProfessional ? data.professionalName : data.customerName;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #10b981;">
          <h1>Service Completed</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName},</p>
          <p>The service has been marked as completed!</p>

          <div class="booking-details">
            <p><span class="label">Service:</span> ${data.serviceName}</p>
            <p><span class="label">Date:</span> ${data.scheduledDate}</p>
            ${data.amount ? `<p><span class="label">Amount Charged:</span> ${data.amount}</p>` : ''}
          </div>

          ${isForProfessional
            ? '<p>Payment will be processed and transferred to your account within 2-3 business days.</p>'
            : '<p>Your payment has been processed. You should see the charge on your statement shortly.</p>'
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="/dashboard/${isForProfessional ? 'pro' : 'customer'}" class="button">Rate Your Experience</a>
          </div>

          <p>We'd love to hear about your experience! Please take a moment to leave a rating.</p>
        </div>
        <div class="footer">
          <p>MaidConnect - Connecting you with trusted service</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
