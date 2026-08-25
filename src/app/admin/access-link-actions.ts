"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { createPasswordResetToken, buildResetLink } from "@/lib/password-reset";

export type AccessLinkState = {
  url?: string;
  error?: string;
};

export async function generateAccessLinkAction(userId: string): Promise<AccessLinkState> {
  await requireStaff();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "Usuário não encontrado." };
  }

  const token = await createPasswordResetToken(userId);
  return { url: buildResetLink(token) };
}
