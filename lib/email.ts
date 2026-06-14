import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_to_pass_build_00000000');

export async function sendWithdrawalApprovedEmail(
  userEmail: string,
  userName: string,
  amount: number,
  amountUsd: number,
  txHash: string
) {
  try {
    await resend.emails.send({
      from: 'Freecoino <noreply@freecoino.com>',
      to: userEmail,
      subject: '✅ Your Withdrawal Has Been Approved',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Withdrawal Approved</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(180deg, #01d676 0%, #007e45 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Freecoino</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">Hi ${userName},</h2>
                      
                      <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Great news! Your withdrawal request has been <strong style="color: #01d676;">approved</strong> and processed.
                      </p>
                      
                      <!-- Withdrawal Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin: 25px 0; border: 1px solid #e0e0e0;">
                        <tr>
                          <td style="padding: 20px;">
                            <table width="100%" cellpadding="5" cellspacing="0">
                              <tr>
                                <td style="color: #666666; font-size: 14px;">Amount:</td>
                                <td align="right" style="color: #333333; font-size: 14px; font-weight: bold;">${amount.toLocaleString()} coins</td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px;">USD Value:</td>
                                <td align="right" style="color: #01d676; font-size: 16px; font-weight: bold;">$${amountUsd.toFixed(2)} USD</td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px;">Network:</td>
                                <td align="right" style="color: #333333; font-size: 14px; font-weight: bold;">Litecoin (LTC)</td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px; padding-top: 10px;">Transaction Hash:</td>
                                <td align="right" style="padding-top: 10px;">
                                  <a href="https://litecoin.info/tx/${txHash}" target="_blank" style="color: #01d676; font-size: 12px; word-break: break-all; text-decoration: none;">
                                    ${txHash}
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        You can view the transaction details on the blockchain using the transaction hash above.
                      </p>
                      
                      <div style="margin-top: 30px; text-align: center;">
                        <a href="https://freecoino.com/history" style="display: inline-block; background: linear-gradient(180deg, #01d676 0%, #007e45 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                          View Withdrawal History
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                        This is an automated message from Freecoino.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        Need help? Contact us at <a href="mailto:support@freecoino.com" style="color: #01d676; text-decoration: none;">support@freecoino.com</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendWithdrawalRejectedEmail(
  userEmail: string,
  userName: string,
  amount: number,
  amountUsd: number,
  reason: string
) {
  try {
    await resend.emails.send({
      from: 'Freecoino <noreply@freecoino.com>',
      to: userEmail,
      subject: '❌ Withdrawal Request Rejected',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Withdrawal Rejected</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(180deg, #f87171 0%, #dc2626 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Freecoino</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">Hi ${userName},</h2>
                      
                      <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        We regret to inform you that your withdrawal request has been <strong style="color: #f87171;">rejected</strong>.
                      </p>
                      
                      <!-- Withdrawal Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 6px; margin: 25px 0; border: 1px solid #fecaca;">
                        <tr>
                          <td style="padding: 20px;">
                            <table width="100%" cellpadding="5" cellspacing="0">
                              <tr>
                                <td style="color: #666666; font-size: 14px;">Amount:</td>
                                <td align="right" style="color: #333333; font-size: 14px; font-weight: bold;">${amount.toLocaleString()} coins</td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px;">USD Value:</td>
                                <td align="right" style="color: #f87171; font-size: 16px; font-weight: bold;">$${amountUsd.toFixed(2)} USD</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding-top: 15px; border-top: 1px solid #fecaca;">
                                  <p style="margin: 10px 0 0 0; color: #666666; font-size: 13px; font-weight: bold;">Rejection Reason:</p>
                                  <p style="margin: 5px 0 0 0; color: #333333; font-size: 14px; line-height: 1.6;">
                                    ${reason}
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="background-color: #f0fdf4; border-left: 4px solid #01d676; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #166534; font-size: 14px; font-weight: bold;">
                          ✓ Your coins have been refunded
                        </p>
                        <p style="margin: 5px 0 0 0; color: #15803d; font-size: 13px;">
                          The ${amount.toLocaleString()} coins have been returned to your account balance.
                        </p>
                      </div>
                      
                      <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        If you have questions or believe this was a mistake, please contact our support team.
                      </p>
                      
                      <div style="margin-top: 30px; text-align: center;">
                        <a href="https://freecoino.com/contact" style="display: inline-block; background: linear-gradient(180deg, #01d676 0%, #007e45 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 14px; margin-right: 10px;">
                          Contact Support
                        </a>
                        <a href="https://freecoino.com/cashout" style="display: inline-block; background-color: #f3f4f6; color: #333333; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 14px; border: 1px solid #d1d5db;">
                          Try Again
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                        This is an automated message from Freecoino.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        Need help? Contact us at <a href="mailto:support@freecoino.com" style="color: #01d676; text-decoration: none;">support@freecoino.com</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
