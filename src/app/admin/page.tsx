import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export default async function AdminDashboardPage() {
  const user = await requireStaff();

  const today = startOfToday();
  const weekEnd = addDays(today, 7);

  const [todayReservations, weekEvents, activeMembers, pendingReservations] =
    await Promise.all([
      prisma.reservation.findMany({
        where: { date: { gte: today, lte: endOfToday() } },
        orderBy: { time: "asc" },
        include: { member: true, table: true },
      }),
      prisma.event.findMany({
        where: { startDate: { gte: today, lt: weekEnd } },
        orderBy: { startDate: "asc" },
      }),
      prisma.user.count({ where: { role: "MEMBER", active: true } }),
      prisma.reservation.count({ where: { status: "PENDING" } }),
    ]);

  return (
    <div>
      <h1 className="font-brand text-2xl mb-1">
        Olá, {user.name?.split(" ")[0] ?? "equipe"}
      </h1>
      <p className="text-muted mb-8">Resumo da casa para hoje.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-2xl font-semibold text-gold">
            {todayReservations.length}
          </p>
          <p className="text-sm text-muted">Reservas hoje</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-semibold text-gold">{pendingReservations}</p>
          <p className="text-sm text-muted">Pendentes de confirmação</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-semibold text-gold">{weekEvents.length}</p>
          <p className="text-sm text-muted">Eventos nos próximos 7 dias</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-semibold text-gold">{activeMembers}</p>
          <p className="text-sm text-muted">Membros ativos</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-muted uppercase tracking-wide">
              Reservas de hoje
            </h2>
            <Link href="/admin/reservations" className="text-sm text-gold">
              Ver todas
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {todayReservations.length === 0 && (
              <p className="text-sm text-muted">Nenhuma reserva para hoje.</p>
            )}
            {todayReservations.map((r) => (
              <div key={r.id} className="flex justify-between text-sm">
                <span>
                  {r.time} · {r.member.name}
                </span>
                <span className="text-muted">
                  {r.partySize}p{r.table ? ` · ${r.table.name}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-muted uppercase tracking-wide">
              Agenda da semana
            </h2>
            <Link href="/admin/events" className="text-sm text-gold">
              Ver todos
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {weekEvents.length === 0 && (
              <p className="text-sm text-muted">Nenhum evento programado.</p>
            )}
            {weekEvents.map((e) => (
              <div key={e.id} className="flex justify-between text-sm">
                <span>{e.title}</span>
                <span className="text-muted">
                  {format(e.startDate, "EEE dd/MM", { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
