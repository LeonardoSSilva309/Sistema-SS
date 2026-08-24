import { Resend } from "resend";

let client: Resend | null = null;

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const resend = getClient();
  if (!resend) {
    console.warn(
      "RESEND_API_KEY não configurada — e-mail não enviado:",
      options.subject
    );
    return { skipped: true as const };
  }

  const from = process.env.EMAIL_FROM ?? "Sweet Secrets <avisos@sweetsecrets.example>";

  return resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
