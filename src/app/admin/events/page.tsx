import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { deleteEventAction } from "./actions";
import SendDigestButton from "./send-digest-button";

export default async function EventsPage() {
  await requireStaff();

  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    where: { startDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-brand text-2xl">Agenda / Eventos</h1>
        <Link href="/admin/events/new" className="btn btn-primary">
          Novo evento
        </Link>
      </div>

      <div className="mb-6">
        <SendDigestButton />
      </div>

      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <div key={event.id} className="card p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="text-gold font-brand text-lg w-16 shrink-0 text-center">
                {format(event.startDate, "dd/MM", { locale: ptBR })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{event.title}</p>
                  <span
                    className={`badge ${
                      event.type === "INTERNAL"
                        ? "bg-gold/15 text-gold"
                        : "bg-surface-2 text-muted"
                    }`}
                  >
                    {event.type === "INTERNAL" ? "Interno" : "Externo"}
                  </span>
                  {!event.isPublic && (
                    <span className="badge bg-surface-2 text-muted">Interno da equipe</span>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-muted mt-0.5">{event.description}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  {format(event.startDate, "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href={`/admin/events/${event.id}`}
                className="text-xs text-gold hover:underline"
              >
                Editar
              </Link>
              <form action={deleteEventAction.bind(null, event.id)}>
                <button className="text-xs text-danger hover:underline">Excluir</button>
              </form>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-muted text-center py-10">
            Nenhum evento futuro cadastrado.
          </p>
        )}
      </div>
    </div>
  );
}
