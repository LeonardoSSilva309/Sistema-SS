import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { cancelOwnReservationAction } from "./actions";
import type { ReservationStatus } from "@prisma/client";

const statusLabels: Record<ReservationStatus, string> = {
  PENDING: "Aguardando confirmação",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
  NO_SHOW: "Não compareceu",
};

const statusColors: Record<ReservationStatus, string> = {
  PENDING: "bg-gold/15 text-gold",
  CONFIRMED: "bg-success/15 text-success",
  CANCELLED: "bg-danger/15 text-danger",
  COMPLETED: "bg-surface-2 text-muted",
  NO_SHOW: "bg-danger/15 text-danger",
};

export default async function PortalReservationsPage() {
  const user = await requireUser();

  const reservations = await prisma.reservation.findMany({
    where: { memberId: user.id },
    orderBy: { date: "desc" },
    include: { table: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-brand text-2xl">Minhas reservas</h1>
        <Link href="/portal/reservations/new" className="btn btn-primary">
          Nova reserva
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {reservations.map((r) => (
          <div key={r.id} className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">
                {format(r.date, "EEEE, dd/MM/yyyy", { locale: ptBR })} às {r.time}
              </p>
              <p className="text-sm text-muted">
                {r.partySize} pessoas{r.table ? ` · ${r.table.name}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${statusColors[r.status]}`}>
                {statusLabels[r.status]}
              </span>
              {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                <form action={cancelOwnReservationAction.bind(null, r.id)}>
                  <button className="text-xs text-danger hover:underline">
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
        {reservations.length === 0 && (
          <p className="text-sm text-muted card p-4 text-center">
            Você ainda não tem reservas.
          </p>
        )}
      </div>
    </div>
  );
}
