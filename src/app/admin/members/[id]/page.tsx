import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { updateMemberAction, toggleMemberActiveAction } from "../actions";
import MemberForm from "../member-form";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
  NO_SHOW: "Não compareceu",
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;

  const member = await prisma.user.findFirst({
    where: { id, role: "MEMBER" },
    include: {
      reservations: {
        orderBy: { date: "desc" },
        take: 10,
        include: { table: true },
      },
    },
  });

  if (!member) notFound();

  const updateAction = updateMemberAction.bind(null, member.id);
  const toggleAction = toggleMemberActiveAction.bind(null, member.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-brand text-2xl">{member.name}</h1>
        <form action={toggleAction}>
          <button
            type="submit"
            className={member.active ? "btn btn-danger" : "btn btn-secondary"}
          >
            {member.active ? "Desativar membro" : "Reativar membro"}
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
            Dados do membro
          </h2>
          <MemberForm
            action={updateAction}
            defaultValues={member}
            submitLabel="Salvar alterações"
          />
        </div>

        <div className="card p-6">
          <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
            Últimas reservas
          </h2>
          <div className="flex flex-col gap-3">
            {member.reservations.length === 0 && (
              <p className="text-sm text-muted">Nenhuma reserva registrada.</p>
            )}
            {member.reservations.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0"
              >
                <div>
                  <p>
                    {format(r.date, "dd/MM/yyyy", { locale: ptBR })} às {r.time}
                  </p>
                  <p className="text-muted">
                    {r.partySize} pessoas
                    {r.table ? ` · ${r.table.name}` : ""}
                  </p>
                </div>
                <span className="badge bg-surface-2">{statusLabels[r.status]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
