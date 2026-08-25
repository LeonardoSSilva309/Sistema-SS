"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";

const noteSchema = z.object({
  content: z.string().trim().min(1, "Escreva algo antes de salvar."),
});

export type NoteFormState = {
  error?: string;
};

export async function addMemberNoteAction(
  memberId: string,
  _prevState: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const staff = await requireStaff();

  const parsed = noteSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.memberNote.create({
    data: {
      memberId,
      content: parsed.data.content,
      createdById: staff.id,
    },
  });

  revalidatePath(`/admin/members/${memberId}`);
  return {};
}
