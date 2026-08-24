"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const staffSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  role: z.enum(["ADMIN", "STAFF"]),
});

export type StaffFormState = {
  error?: string;
};

function randomPassword() {
  return Math.random().toString(36).slice(-10) + "Aa1!";
}

export async function createStaffAction(
  _prevState: StaffFormState,
  formData: FormData
): Promise<StaffFormState> {
  await requireAdmin();

  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await bcrypt.hash(randomPassword(), 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash,
    },
  });

  revalidatePath("/admin/staff");
  return {};
}

export async function toggleStaffActiveAction(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.user.update({
    where: { id: userId },
    data: { active: !user.active },
  });

  revalidatePath("/admin/staff");
}
