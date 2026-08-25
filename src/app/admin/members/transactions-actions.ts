"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";

const transactionSchema = z.object({
  type: z.enum(["CREDIT", "DEBIT"]),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  description: z.string().trim().optional(),
});

export type TransactionFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function addTransactionAction(
  memberId: string,
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const staff = await requireStaff();

  const parsed = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  await prisma.consumptionTransaction.create({
    data: {
      memberId,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description || null,
      createdById: staff.id,
    },
  });

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/consumption");
  revalidatePath("/portal");
  return {};
}
