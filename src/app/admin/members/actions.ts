"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";

const memberSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type MemberFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function randomPassword() {
  return Math.random().toString(36).slice(-10) + "Aa1!";
}

export async function createMemberAction(
  _prevState: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  await requireStaff();

  const parsed = memberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { fieldErrors: { email: "Já existe uma conta com este e-mail." } };
  }

  const passwordHash = await bcrypt.hash(randomPassword(), 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
      passwordHash,
      role: "MEMBER",
    },
  });

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function updateMemberAction(
  memberId: string,
  _prevState: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  await requireStaff();

  const parsed = memberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const existing = await prisma.user.findFirst({
    where: { email: parsed.data.email, NOT: { id: memberId } },
  });
  if (existing) {
    return { fieldErrors: { email: "Já existe uma conta com este e-mail." } };
  }

  await prisma.user.update({
    where: { id: memberId },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  redirect("/admin/members");
}

export async function toggleMemberActiveAction(memberId: string) {
  await requireStaff();

  const member = await prisma.user.findUnique({ where: { id: memberId } });
  if (!member) return;

  await prisma.user.update({
    where: { id: memberId },
    data: { active: !member.active },
  });

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
}
