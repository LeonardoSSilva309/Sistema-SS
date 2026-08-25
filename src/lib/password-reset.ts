import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_HOURS = 48;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: expires,
    },
  });

  return token;
}

export async function getUserByResetToken(token: string) {
  const tokenHash = hashToken(token);
  const user = await prisma.user.findUnique({
    where: { passwordResetTokenHash: tokenHash },
  });

  if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    return null;
  }

  return user;
}

export async function clearPasswordResetToken(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordResetTokenHash: null, passwordResetExpires: null },
  });
}

export function buildResetLink(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/set-password?token=${token}`;
}
