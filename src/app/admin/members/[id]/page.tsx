import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { getMemberBalance, formatCurrency } from "@/lib/balance";
import { getMemberVisitCount } from "@/lib/member-stats";
import { updateMemberAction, toggleMemberActiveAction } from "../actions";
import MemberForm from "../member-form";
import TransactionForm from "../transaction-form";
import AccessLinkButton from "../../access-link-button";
import PhotoUpload from "../photo-upload";
import NotesLog from "../notes-log";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
  NO_SHOW: "Não compareceu",
};

const categoryLabels: Record<string, string> = {
  REGULAR: "Regular",
  VIP: "VIP",
  FOUNDER: "Fundador",
  GUEST: "Convidado",
};

const categoryColors: Record<string, string> = {
  REGULAR: "bg-surface-2 text-muted",
  VIP: "bg-gold/15 text-gold",
  FOUNDER: "bg-gold/15 text-gold",
  GUEST: "bg-surface-2 text-muted",
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
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 15,
      },
      memberNotes: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { createdBy: { select: { name: true } } },
      },
    },
  });

  if (!member) notFound();

  const [balance, visitCount] = await Promise.all([
    getMemberBalance(member.id),
    getMemberVisitCount(member.id),
  ]);

  const updateAction = updateMemberAction.bind(null, member.id);
  const toggleAction = toggleMemberActiveAction.bind(null, member.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <PhotoUpload memberId={member.id} name={member.name} photoUrl={member.photoUrl} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl">{member.name}</h1>
              <span className={`badge ${categoryColors[member.category]}`}>
                {categoryLabels[member.category]}
              </span>
            </div>
            <p className="text-sm text-muted mt-1">
              Membro desde {format(member.memberSince, "MMMM 'de' yyyy", { locale: ptBR })}
              {member.birthday &&
                ` · Aniversário em ${format(member.birthday, "dd/MM", { locale: ptBR })}`}
            </p>
          </div>
        </div>
        <form action={toggleAction}>
          <button
            type="submit"
            className={member.active ? "btn btn-danger" : "btn btn-secondary"}
          >
            {member.active ? "Desativar membro" : "Reativar membro"}
          </button>
        </form>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
          Acesso ao sistema
        </h2>
        <p className="text-sm text-muted mb-3">
          Gere um link para o membro definir a própria senha (primeiro acesso ou
          esqueceu a senha).
        </p>
        <AccessLinkButton userId={member.id} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
            Dados do membro
          </h2>
          <MemberForm
            action={updateAction}
            defaultValues={{
              ...member,
              monthlyFee: member.monthlyFee ? member.monthlyFee.toNumber() : null,
            }}
            submitLabel="Salvar alterações"
          />
        </div>

        <div className="card p-6">
          <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
            Últimas reservas
            <span className="text-foreground normal-case ml-1">
              ({visitCount} {visitCount === 1 ? "visita concluída" : "visitas concluídas"})
            </span>
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

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-muted uppercase tracking-wide">Consumação</h2>
            <span
              className={`font-brand text-xl ${balance < 0 ? "text-danger" : "text-gold"}`}
            >
              {formatCurrency(balance)}
            </span>
          </div>
          <TransactionForm memberId={member.id} />
        </div>

        <div className="card p-6">
          <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
            Últimos lançamentos
          </h2>
          <div className="flex flex-col gap-3">
            {member.transactions.length === 0 && (
              <p className="text-sm text-muted">Nenhum lançamento registrado.</p>
            )}
            {member.transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0"
              >
                <div>
                  <p>
                    {t.type === "CREDIT" ? "Recarga" : "Consumo"}
                    {t.description ? ` — ${t.description}` : ""}
                  </p>
                  <p className="text-muted">
                    {format(t.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <span className={t.type === "CREDIT" ? "text-success" : "text-danger"}>
                  {t.type === "CREDIT" ? "+" : "-"}
                  {formatCurrency(t.amount.toNumber())}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
          Histórico de observações
        </h2>
        <NotesLog memberId={member.id} notes={member.memberNotes} />
      </div>
    </div>
  );
}
