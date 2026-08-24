import { requireStaff } from "@/lib/session";
import { createEventAction } from "../actions";
import EventForm from "../event-form";

export default async function NewEventPage() {
  await requireStaff();

  return (
    <div>
      <h1 className="font-brand text-2xl mb-6">Novo evento</h1>
      <div className="card p-6 max-w-lg">
        <EventForm action={createEventAction} submitLabel="Criar evento" />
      </div>
    </div>
  );
}
