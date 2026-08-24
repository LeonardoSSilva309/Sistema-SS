import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { updateReservationStatusAction } from "./actions";
import type { ReservationStatus } from "@prisma/client";

const statusLabels: Record<ReservationStatus, string> = {
  PENDING: "Pendente",
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

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireStaff();
  const { date } = await searchParams;

  const selectedDate = date ? new Date(`${date}T00:00:00`) : new Date();
  selectedDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
  const dateParam = format(selectedDate, "yyyy-MM-dd");

  const reservations = await prisma.reservation.findMany({
    where: { date: { gte: selectedDate, lt: nextDay } },
    orderBy: { time: "asc" },
    include: { member: true, table: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-brand text-2xl">Reservas</h1>
        <div className="flex gap-2">
          <Link href="/admin/reservations/tables" className="btn btn-secondary">
            Mesas
          </Link>
          <Link href="/admin/reservations/new" className="btn btn-primary">
            Nova reserva
          </Link>
        </div>
      </div>

      <form className="mb-5 flex items-center gap-3">
        <input
          type="date"
          name="date"
          defaultValue={dateParam}
          className="input max-w-[180px]"
        />
        <button type="submit" className="btn btn-secondary">
          Filtrar
        </button>
        <span className="text-sm text-muted">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </span>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="px-4 py-3 font-medium">Horário</th>
              <th className="px-4 py-3 font-medium">Membro</th>
              <th className="px-4 py-3 font-medium">Pessoas</th>
              <th className="px-4 py-3 font-medium">Mesa</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border last:border-0 hover:bg-surface-2"
              >
                <td className="px-4 py-3">{r.time}</td>
                <td className="px-4 py-3">{r.member.name}</td>
                <td className="px-4 py-3">{r.partySize}</td>
                <td className="px-4 py-3 text-muted">{r.table?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${statusColors[r.status]}`}>
                    {statusLabels[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {r.status !== "CONFIRMED" && r.status !== "COMPLETED" && (
                      <form
                        action={updateReservationStatusAction.bind(
                          null,
                          r.id,
                          "CONFIRMED"
                        )}
                      >
                        <button className="text-xs text-success hover:underline">
                          Confirmar
                        </button>
                      </form>
                    )}
                    {r.status === "CONFIRMED" && (
                      <form
                        action={updateReservationStatusAction.bind(
                          null,
                          r.id,
                          "COMPLETED"
                        )}
                      >
                        <button className="text-xs text-muted hover:underline">
                          Concluir
                        </button>
                      </form>
                    )}
                    {r.status !== "CANCELLED" && r.status !== "COMPLETED" && (
                      <form
                        action={updateReservationStatusAction.bind(
                          null,
                          r.id,
                          "CANCELLED"
                        )}
                      >
                        <button className="text-xs text-danger hover:underline">
                          Cancelar
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  Nenhuma reserva para esta data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
