import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { updateEventAction } from "../actions";
import EventForm from "../event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  const action = updateEventAction.bind(null, event.id);

  return (
    <div>
      <h1 className="font-brand text-2xl mb-6">Editar evento</h1>
      <div className="card p-6 max-w-lg">
        <EventForm action={action} defaultValues={event} submitLabel="Salvar alterações" />
      </div>
    </div>
  );
}
