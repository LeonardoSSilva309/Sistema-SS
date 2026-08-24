"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";

const tableSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da mesa."),
  capacity: z.coerce.number().int().min(1, "Informe a capacidade."),
  location: z.string().trim().optional(),
});

export type TableFormState = {
  error?: string;
};

export async function createTableAction(
  _prevState: TableFormState,
  formData: FormData
): Promise<TableFormState> {
  await requireStaff();

  const parsed = tableSchema.safeParse({
    name: formData.get("name"),
    capacity: formData.get("capacity"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.restaurantTable.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: "Já existe uma mesa com esse nome." };
  }

  await prisma.restaurantTable.create({
    data: {
      name: parsed.data.name,
      capacity: parsed.data.capacity,
      location: parsed.data.location || null,
    },
  });

  revalidatePath("/admin/reservations/tables");
  return {};
}

export async function toggleTableActiveAction(tableId: string) {
  await requireStaff();

  const table = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
  if (!table) return;

  await prisma.restaurantTable.update({
    where: { id: tableId },
    data: { active: !table.active },
  });

  revalidatePath("/admin/reservations/tables");
}
