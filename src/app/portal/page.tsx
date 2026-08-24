import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export default async function PortalHomePage() {
  const user = await requireUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = addDays(today, 7);

  const [events, nextReservation] = await Promise.all([
    prisma.event.findMany({
      where: { isPublic: true, startDate: { gte: today, lt: weekEnd } },
      orderBy: { startDate: "asc" },
    }),
    prisma.reservation.findFirst({
      where: {
        memberId: user.id,
        date: { gte: today },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { date: "asc" },
      include: { table: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-brand text-2xl mb-1">
        Olá, {user.name?.split(" ")[0] ?? "membro"}
      </h1>
      <p className="text-muted mb-8">O que vai rolar no Sweet Secrets esta semana.</p>

      {nextReservation && (
        <div className="card p-4 mb-8 border-gold/40">
          <p className="text-sm text-muted mb-1">Sua próxima reserva</p>
          <p className="font-medium">
            {format(nextReservation.date, "EEEE, dd/MM", { locale: ptBR })} às{" "}
            {nextReservation.time} · {nextReservation.partySize} pessoas
          </p>
          <p className="text-sm text-muted mt-1">
            Status:{" "}
            {nextReservation.status === "PENDING" ? "aguardando confirmação" : "confirmada"}
            {nextReservation.table ? ` · ${nextReservation.table.name}` : ""}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm text-muted uppercase tracking-wide">
          Próximos 7 dias
        </h2>
        <Link href="/portal/reservations/new" className="btn btn-primary text-sm">
          Reservar mesa
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {events.length === 0 && (
          <p className="text-sm text-muted card p-4">
            Nenhum evento divulgado para esta semana ainda.
          </p>
        )}
        {events.map((event) => (
          <div key={event.id} className="card p-4 flex items-start gap-4">
            <div className="text-gold font-brand text-lg w-24 shrink-0">
              {format(event.startDate, "EEE dd/MM", { locale: ptBR })}
              {isSameDay(event.startDate, today) && (
                <span className="block text-xs text-success">Hoje</span>
              )}
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
                  {event.type === "INTERNAL" ? "Evento da casa" : "Evento externo"}
                </span>
              </div>
              {event.description && (
                <p className="text-sm text-muted mt-0.5">{event.description}</p>
              )}
              <p className="text-xs text-muted mt-1">
                {format(event.startDate, "HH:mm", { locale: ptBR })}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
