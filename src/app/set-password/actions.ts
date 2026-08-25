"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { getUserByResetToken, clearPasswordResetToken } from "@/lib/password-reset";

const schema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type SetPasswordState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function setPasswordAction(
  _prevState: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const user = await getUserByResetToken(parsed.data.token);
  if (!user) {
    return { error: "Link inválido ou expirado. Peça um novo link à equipe." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  await clearPasswordResetToken(user.id);

  const redirectTo = user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/portal";

  try {
    await signIn("credentials", {
      email: user.email,
      password: parsed.data.password,
      redirectTo,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Senha definida, mas não foi possível entrar automaticamente. Faça login." };
    }
    throw error;
  }
}
