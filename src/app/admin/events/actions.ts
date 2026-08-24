"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { sendWeeklyDigest } from "@/lib/digest";

const eventSchema = z.object({
  title: z.string().trim().min(2, "Informe o título do evento."),
  description: z.string().trim().optional(),
  type: z.enum(["INTERNAL", "EXTERNAL"]),
  startDate: z.string().min(1, "Informe a data de início."),
  endDate: z.string().optional(),
  location: z.string().trim().optional(),
  isPublic: z.string().optional(),
});

export type EventFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseEventForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    location: formData.get("location"),
    isPublic: formData.get("isPublic"),
  });
}

export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const staff = await requireStaff();
  const parsed = parseEventForm(formData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  await prisma.event.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      location: parsed.data.location || null,
      isPublic: parsed.data.isPublic === "on",
      createdById: staff.id,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/portal");
  revalidatePath("/");
  redirect("/admin/events");
}

export async function updateEventAction(
  eventId: string,
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireStaff();
  const parsed = parseEventForm(formData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      location: parsed.data.location || null,
      isPublic: parsed.data.isPublic === "on",
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/portal");
  revalidatePath("/");
  redirect("/admin/events");
}

export async function deleteEventAction(eventId: string) {
  await requireStaff();
  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/admin/events");
  revalidatePath("/portal");
  revalidatePath("/");
}

export type DigestResultState = {
  message?: string;
  error?: string;
};

export async function sendDigestNowAction(): Promise<DigestResultState> {
  await requireStaff();

  try {
    const result = await sendWeeklyDigest();
    if (result.eventCount === 0) {
      return { message: "Nenhum evento nos próximos 7 dias — nenhum e-mail enviado." };
    }
    return {
      message: `Resumo enviado para ${result.sent} membro(s) sobre ${result.eventCount} evento(s).`,
    };
  } catch {
    return { error: "Não foi possível enviar o resumo agora." };
  }
}
