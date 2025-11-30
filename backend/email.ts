import { promisify } from "node:util";
import { execFile } from "node:child_process";

interface EmailMessage {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

async function getAuthToken(): Promise<{ authToken: string; hostname: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  
  if (!hostname) {
    throw new Error("REPLIT_CONNECTORS_HOSTNAME not available");
  }
  
  const execFileAsync = promisify(execFile);
  const { stdout } = await execFileAsync(
    "replit",
    ["identity", "create", "--audience", `https://${hostname}`],
    { encoding: "utf8" }
  );

  const replitToken = stdout.trim();
  if (!replitToken) {
    throw new Error("Replit Identity Token not found");
  }

  return { authToken: `Bearer ${replitToken}`, hostname };
}

export async function sendEmail(message: EmailMessage): Promise<{
  accepted: string[];
  rejected: string[];
  messageId: string;
  response: string;
}> {
  try {
    const { hostname, authToken } = await getAuthToken();

    const response = await fetch(
      `https://${hostname}/api/v2/mailer/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Replit-Authentication": authToken,
        },
        body: JSON.stringify({
          to: message.to,
          cc: message.cc,
          subject: message.subject,
          text: message.text,
          html: message.html,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send email");
    }

    return await response.json();
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

export function generateRecoveryCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendPasswordRecoveryEmail(
  email: string,
  code: string
): Promise<boolean> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ffff; margin: 0;">FiberTrace</h1>
        <p style="color: #64748b; margin: 5px 0;">Password Recovery</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; padding: 30px; border: 1px solid #00ffff;">
        <h2 style="color: #f8fafc; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #94a3b8;">We received a request to reset your password. Use the code below to complete the process:</p>
        
        <div style="background: rgba(0, 255, 255, 0.1); border: 2px dashed #00ffff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #00ffff; letter-spacing: 8px;">${code}</span>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px;">This code will expire in 15 minutes.</p>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't request this reset, please ignore this email.</p>
      </div>
      
      <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 20px;">
        FiberTrace - Fiber Network Documentation
      </p>
    </div>
  `;

  const textContent = `
FiberTrace Password Recovery

We received a request to reset your password.

Your recovery code is: ${code}

This code will expire in 15 minutes.

If you didn't request this reset, please ignore this email.

- FiberTrace Team
  `;

  try {
    await sendEmail({
      to: email,
      subject: "FiberTrace - Password Recovery Code",
      html: htmlContent,
      text: textContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send recovery email:", error);
    return false;
  }
}
