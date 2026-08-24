"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import type { ReservationStatus } from "@prisma/client";

const reservationSchema = z.object({
  memberId: z.string().min(1, "Selecione um membro."),
  tableId: z.string().optional(),
  date: z.string().min(1, "Informe a data."),
  time: z.string().min(1, "Informe o horário."),
  partySize: z.coerce.number().int().min(1, "Informe o número de pessoas."),
  notes: z.string().trim().optional(),
});

export type ReservationFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createReservationAction(
  _prevState: ReservationFormState,
  formData: FormData
): Promise<ReservationFormState> {
  const staff = await requireStaff();

  const parsed = reservationSchema.safeParse({
    memberId: formData.get("memberId"),
    tableId: formData.get("tableId"),
    date: formData.get("date"),
    time: formData.get("time"),
    partySize: formData.get("partySize"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  await prisma.reservation.create({
    data: {
      memberId: parsed.data.memberId,
      tableId: parsed.data.tableId || null,
      date: new Date(`${parsed.data.date}T00:00:00`),
      time: parsed.data.time,
      partySize: parsed.data.partySize,
      notes: parsed.data.notes || null,
      status: "CONFIRMED",
      createdById: staff.id,
    },
  });

  revalidatePath("/admin/reservations");
  redirect("/admin/reservations");
}

export async function updateReservationStatusAction(
  reservationId: string,
  status: ReservationStatus
) {
  await requireStaff();

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status },
  });

  revalidatePath("/admin/reservations");
}
