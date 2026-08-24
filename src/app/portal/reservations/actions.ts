"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const requestSchema = z.object({
  date: z.string().min(1, "Informe a data."),
  time: z.string().min(1, "Informe o horário."),
  partySize: z.coerce.number().int().min(1, "Informe o número de pessoas."),
  notes: z.string().trim().optional(),
});

export type ReservationRequestState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function requestReservationAction(
  _prevState: ReservationRequestState,
  formData: FormData
): Promise<ReservationRequestState> {
  const user = await requireUser();

  const parsed = requestSchema.safeParse({
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

  const date = new Date(`${parsed.data.date}T00:00:00`);
  if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
    return { fieldErrors: { date: "Escolha uma data futura." } };
  }

  await prisma.reservation.create({
    data: {
      memberId: user.id,
      date,
      time: parsed.data.time,
      partySize: parsed.data.partySize,
      notes: parsed.data.notes || null,
      status: "PENDING",
    },
  });

  revalidatePath("/portal/reservations");
  revalidatePath("/admin/reservations");
  redirect("/portal/reservations");
}

export async function cancelOwnReservationAction(reservationId: string) {
  const user = await requireUser();

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation || reservation.memberId !== user.id) return;
  if (reservation.status === "COMPLETED") return;

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/portal/reservations");
  revalidatePath("/admin/reservations");
}
