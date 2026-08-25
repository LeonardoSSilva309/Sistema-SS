"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken, buildResetLink } from "@/lib/password-reset";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
});

export type ForgotPasswordState = {
  submitted?: boolean;
  fieldErrors?: Record<string, string>;
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = schema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (user && user.active) {
    const token = await createPasswordResetToken(user.id);
    const link = buildResetLink(token);
    await sendEmail({
      to: user.email,
      subject: "Sweet Secrets — redefinir senha",
      html: `
        <div style="background:#0b0b0d;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:480px;margin:0 auto;background:#16151a;border-radius:12px;padding:28px;border:1px solid #2a2830;">
            <p style="color:#c9a15a;font-size:22px;font-family:Georgia,serif;margin:0 0 16px;">Sweet Secrets</p>
            <p style="color:#f3ede0;font-size:14px;">Olá, ${user.name.split(" ")[0]}!</p>
            <p style="color:#a79f8f;font-size:13px;">Clique no link abaixo para definir uma nova senha. Ele expira em 48 horas.</p>
            <p style="margin-top:20px;"><a href="${link}" style="color:#1a1409;background:#c9a15a;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Redefinir senha</a></p>
            <p style="color:#666;font-size:11px;margin-top:24px;">Se você não pediu isso, ignore este e-mail.</p>
          </div>
        </div>`,
    });
  }

  // Sempre retorna a mesma mensagem, exista ou não a conta, para não vazar quais e-mails são cadastrados.
  return { submitted: true };
}
