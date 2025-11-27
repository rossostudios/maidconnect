/**
 * Email templates for booking notifications
 * Uses simple HTML for maximum email client compatibility
 */

type BookingEmailData = {
  customerName: string;
  professionalName: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: string;
  address: string;
  bookingId: string;
  amount?: string;
};

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #171717;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .container {
    background-color: #FFFFFF;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 4px rgba(22,22,22,0.1);
  }
  .header {
    background-color: #FF5200;
    color: white;
    padding: 20px;
    border-radius: 8px 8px 0 0;
    text-align: center;
  }
  .content {
    padding: 20px;
  }
  .booking-details {
    background-color: #FFFFFF;
    padding: 15px;
    border-radius: 6px;
    margin: 20px 0;
  }
  .booking-details p {
    margin: 8px 0;
  }
  .label {
    font-weight: 600;
    color: #737373;
  }
  .button {
    display: inline-block;
    background-color: #FF5200;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 6px;
    margin: 10px 5px;
  }
  .button-secondary {
    background-color: #737373;
  }
  .footer {
    text-align: center;
    color: #737373;
    font-size: 14px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #E5E5E5;
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
            ${data.amount ? `<p><span class="label">Amount:</span> ${data.amount}</p>` : ""}
          </div>

          <p><strong>⏰ Please respond within 24 hours</strong> or this booking will be automatically declined.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="button">View Full Booking Details</a>
          </div>

          <p>View the complete booking information including location and customer details in your dashboard.</p>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function bookingConfirmedEmailForCustomer(
  data: BookingEmailData,
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
            ${data.amount ? `<p><span class="label">Amount:</span> ${data.amount}</p>` : ""}
          </div>

          <p>Your payment has been authorized and will be charged after the service is completed.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="button">View Full Booking Details</a>
          </div>

          <p>View the complete service address and contact your professional through the app.</p>

          <p><strong>What's next?</strong></p>
          <ul>
            <li>You'll receive a reminder 24 hours before your service</li>
            <li>Your professional will check in when they arrive</li>
            <li>After service completion, you can rate your experience</li>
          </ul>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
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
        <div class="header" style="background-color: #737373;">
          <h1>Booking Declined</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Unfortunately, <strong>${data.professionalName}</strong> was unable to accept your booking request.</p>

          <div class="booking-details">
            <p><span class="label">Service:</span> ${data.serviceName}</p>
            <p><span class="label">Date:</span> ${data.scheduledDate}</p>
            <p><span class="label">Time:</span> ${data.scheduledTime}</p>
            ${reason ? `<p><span class="label">Reason:</span> ${reason}</p>` : ""}
          </div>

          <p><strong>Your payment authorization has been voided.</strong> No charges will be made to your account.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="/professionals" class="button">Find Another Professional</a>
          </div>

          <p>We have many other qualified professionals available. Browse our directory to find your perfect match!</p>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
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
        <div class="header" style="background-color: #FF5200;">
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
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="/dashboard/${isForProfessional ? "pro" : "customer"}?booking=${data.bookingId}" class="button">View Location & Details</a>
          </div>

          ${
            isForProfessional
              ? "<p><strong>Don't forget to:</strong></p><ul><li>Review the address and any special instructions in your dashboard</li><li>Bring all necessary supplies</li><li>Check in when you arrive using the app</li></ul>"
              : "<p><strong>Please ensure:</strong></p><ul><li>Someone is home at the scheduled time</li><li>The property is accessible</li><li>Any special instructions have been shared through the app</li></ul>"
          }
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
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
  _bookingId: string,
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
          <p>Casaora - Connecting you with trusted service</p>
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
        <div class="header" style="background-color: #FF5200;">
          <h1>Service Completed</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName},</p>
          <p>The service has been marked as completed!</p>

          <div class="booking-details">
            <p><span class="label">Service:</span> ${data.serviceName}</p>
            <p><span class="label">Date:</span> ${data.scheduledDate}</p>
            ${data.amount ? `<p><span class="label">Amount Charged:</span> ${data.amount}</p>` : ""}
          </div>

          ${
            isForProfessional
              ? "<p>Payment will be processed and transferred to your account within 2-3 business days.</p>"
              : "<p>Your payment has been processed. You should see the charge on your statement shortly.</p>"
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="/dashboard/${isForProfessional ? "pro" : "customer"}" class="button">Rate Your Experience</a>
          </div>

          <p>We'd love to hear about your experience! Please take a moment to leave a rating.</p>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function accountSuspendedEmail(
  userName: string,
  reason: string,
  expiresAt: string | null,
  durationDays?: number
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
        <div class="header" style="background-color: #FF5200;">
          <h1>Account Suspended</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Your Casaora account has been ${expiresAt ? "temporarily suspended" : "permanently banned"}.</p>

          <div class="booking-details">
            <p><span class="label">Reason:</span> ${reason}</p>
            ${expiresAt ? `<p><span class="label">Duration:</span> ${durationDays} days</p>` : ""}
            ${expiresAt ? `<p><span class="label">Expires:</span> ${expiresAt}</p>` : '<p><span class="label">Status:</span> Permanent</p>'}
          </div>

          ${
            expiresAt
              ? "<p>During this suspension period, you will not be able to access your account or use Casaora services.</p>"
              : "<p>You will no longer be able to access your account or use Casaora services.</p>"
          }

          <p>If you believe this action was taken in error or would like to appeal, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
          <p>Contact support: support@casaora.co</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function accountUnsuspendedEmail(userName: string, liftReason: string): string {
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
        <div class="header" style="background-color: #FF5200;">
          <h1>Account Restored</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Good news! Your account suspension has been lifted.</p>

          <div class="booking-details">
            <p><span class="label">Note:</span> ${liftReason}</p>
          </div>

          <p>You can now access your account and use Casaora services again.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="/auth/sign-in" class="button">Sign In to Your Account</a>
          </div>

          <p>Thank you for your patience and understanding.</p>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function bookingRescheduleEmail(
  data: BookingEmailData,
  newDate: string,
  newTime: string,
  isForProfessional: boolean
): string {
  const recipientName = isForProfessional ? data.professionalName : data.customerName;
  const otherPartyName = isForProfessional ? data.customerName : data.professionalName;

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
        <div class="header" style="background-color: #FF5200;">
          <h1>Booking Rescheduled</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName},</p>
          <p><strong>${otherPartyName}</strong> has requested to reschedule your booking.</p>

          <div class="booking-details">
            <p><span class="label">Service:</span> ${data.serviceName}</p>
            <p><span class="label">Original Date:</span> ${data.scheduledDate} at ${data.scheduledTime}</p>
            <p><span class="label">New Date:</span> ${newDate} at ${newTime}</p>
            <p><span class="label">Duration:</span> ${data.duration}</p>
          </div>

          <p>Please review the new schedule and confirm your availability. View the full booking details including location in your dashboard.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="/dashboard/${isForProfessional ? "pro" : "customer"}?booking=${data.bookingId}" class="button">View Full Details & Confirm</a>
          </div>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function professionalApplicationApprovedEmail(
  professionalName: string,
  notes?: string
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
        <div class="header" style="background-color: #FF5200;">
          <h1>🎉 Application Approved!</h1>
        </div>
        <div class="content">
          <p>Hi ${professionalName},</p>
          <p><strong>Congratulations!</strong> Your professional application has been approved.</p>

          ${notes ? `<div class="booking-details"><p><span class="label">Admin Note:</span> ${notes}</p></div>` : ""}

          <p><strong>What's next?</strong></p>
          <ul>
            <li>Complete your professional profile</li>
            <li>Set up your Stripe Connect account to receive payments</li>
            <li>Add your services and rates</li>
            <li>Upload portfolio images</li>
            <li>Start accepting bookings!</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="/dashboard/pro" class="button">Complete Your Profile</a>
          </div>

          <p>Welcome to the Casaora professional community!</p>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function professionalApplicationRejectedEmail(
  professionalName: string,
  rejectionReason: string,
  notes?: string
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
        <div class="header" style="background-color: #737373;">
          <h1>Application Update</h1>
        </div>
        <div class="content">
          <p>Hi ${professionalName},</p>
          <p>Thank you for your interest in joining Casaora as a professional service provider.</p>

          <p>After careful review, we're unable to approve your application at this time.</p>

          <div class="booking-details">
            <p><span class="label">Reason:</span> ${rejectionReason}</p>
            ${notes ? `<p><span class="label">Additional Details:</span> ${notes}</p>` : ""}
          </div>

          <p>You may reapply after addressing the concerns mentioned above. We encourage you to:</p>
          <ul>
            <li>Review our professional requirements</li>
            <li>Ensure all documents are complete and valid</li>
            <li>Provide accurate information in your application</li>
          </ul>

          <p>If you have questions or would like more information, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
          <p>Contact support: support@casaora.co</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function professionalInfoRequestedEmail(professionalName: string, notes?: string): string {
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
        <div class="header" style="background-color: #FF5200;">
          <h1>Additional Information Needed</h1>
        </div>
        <div class="content">
          <p>Hi ${professionalName},</p>
          <p>We're reviewing your professional application and need some additional information before we can proceed.</p>

          ${notes ? `<div class="booking-details"><p><span class="label">What we need:</span> ${notes}</p></div>` : ""}

          <p>Please provide the requested information as soon as possible to avoid delays in your application review.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="/dashboard/pro" class="button">Update Application</a>
          </div>

          <p>If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
          <p>Contact support: support@casaora.co</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function rebookNudgeEmail(
  data: BookingEmailData & { professionalId: string },
  variant: "24h" | "72h",
  dashboardUrl: string
): string {
  const timing = variant === "24h" ? "yesterday" : "a few days ago";

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
        <div class="header" style="background-color: #FF5200;">
          <h1>Ready for Your Next Service?</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>We hope you loved your ${data.serviceName} with <strong>${data.professionalName}</strong> ${timing}!</p>

          <p>Based on your positive experience, would you like to book the same service again?</p>

          <div class="booking-details">
            <p><span class="label">Previous Service:</span> ${data.serviceName}</p>
            <p><span class="label">Professional:</span> ${data.professionalName}</p>
            <p><span class="label">Date:</span> ${data.scheduledDate}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}/professionals/${data.professionalId}?prev_booking=${data.bookingId}" class="button">Book Again</a>
          </div>

          <p>Your trusted professional is ready to help you again with the same great service!</p>

          <p style="color: #737373; font-size: 14px; margin-top: 20px;">
            💡 <strong>Pro tip:</strong> Regular bookings help maintain a cleaner, healthier home with less effort each time.
          </p>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
          <p>Not interested? <a href="${dashboardUrl}/settings/notifications" style="color: #737373;">Update your notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function backgroundCheckCompletedEmail(
  professionalName: string,
  status: "clear" | "consider" | "suspended",
  recommendation: "approved" | "review_required" | "rejected"
): string {
  // Determine header color and status message based on result
  let headerColor = "#FF5200"; // green
  let statusTitle = "Background Check Complete";
  let statusMessage = "";
  let nextSteps = "";

  if (status === "clear" && recommendation === "approved") {
    headerColor = "#FF5200"; // green
    statusTitle = "✓ Background Check Complete";
    statusMessage =
      "<p><strong>Great news!</strong> Your background check has been completed and you passed all verification requirements.</p>";
    nextSteps = `
      <p><strong>What's next?</strong></p>
      <ul>
        <li>Your profile will be reviewed by our team within 24-48 hours</li>
        <li>You'll receive a notification once your application is approved</li>
        <li>After approval, you can start accepting bookings</li>
      </ul>
    `;
  } else if (status === "consider" || recommendation === "review_required") {
    headerColor = "#FF5200"; // orange
    statusTitle = "Background Check - Manual Review Required";
    statusMessage =
      "<p>Your background check has been completed. Our team needs to manually review some aspects of your results before making a final decision.</p>";
    nextSteps = `
      <p><strong>What happens next?</strong></p>
      <ul>
        <li>Our team will review your background check within 2-3 business days</li>
        <li>We may contact you if additional information is needed</li>
        <li>You'll receive a notification once the review is complete</li>
      </ul>
      <p>This is a standard procedure and doesn't necessarily indicate any issues.</p>
    `;
  } else {
    // suspended or rejected
    headerColor = "#FF5200"; // red
    statusTitle = "Background Check - Unable to Approve";
    statusMessage =
      "<p>Unfortunately, we're unable to approve your professional application based on the results of your background check.</p>";
    nextSteps = `
      <p><strong>What does this mean?</strong></p>
      <ul>
        <li>Your application cannot proceed at this time</li>
        <li>This decision is based on our safety and trust requirements</li>
        <li>If you believe there's an error, please contact our support team</li>
      </ul>
      <p>We take the safety of our community very seriously and appreciate your understanding.</p>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-case=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: ${headerColor};">
          <h1>${statusTitle}</h1>
        </div>
        <div class="content">
          <p>Hi ${professionalName},</p>

          ${statusMessage}

          <div class="booking-details">
            <p><span class="label">Check Status:</span> ${status === "clear" ? "Passed" : status === "consider" ? "Under Review" : "Did Not Pass"}</p>
            <p><span class="label">Recommendation:</span> ${recommendation === "approved" ? "Approved for Next Steps" : recommendation === "review_required" ? "Manual Review Required" : "Application Declined"}</p>
          </div>

          ${nextSteps}

          ${
            status !== "suspended" && recommendation !== "rejected"
              ? '<div style="text-align: center; margin: 30px 0;"><a href="/dashboard/pro/onboarding" class="button">View Application Status</a></div>'
              : ""
          }

          <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
          <p>Casaora - Connecting you with trusted service</p>
          <p>Contact support: support@casaora.co</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
