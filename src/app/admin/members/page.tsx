import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { getAllMemberBalances, formatCurrency } from "@/lib/balance";
import { getAllMemberVisitCounts } from "@/lib/member-stats";
import Avatar from "@/components/avatar";
import {
  buildMemberWhere,
  categoryLabels,
  sortLabels,
  type MemberQueryParams,
  type MemberSort,
} from "@/lib/member-query";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<MemberQueryParams>;
}) {
  await requireStaff();
  const params = await searchParams;
  const { q, status = "all", category = "all" } = params;
  const sort: MemberSort = params.sort ?? "name";
  const order = params.order ?? "asc";

  const where = buildMemberWhere({ q, status, category });

  const [members, balances, visits] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: sort === "memberSince" ? { memberSince: order } : { name: "asc" },
    }),
    getAllMemberBalances(),
    getAllMemberVisitCounts(),
  ]);

  const rows = members
    .map((member) => ({
      member,
      balance: balances[member.id] ?? 0,
      visits: visits[member.id] ?? 0,
    }))
    .sort((a, b) => {
      if (sort === "balance") return order === "asc" ? a.balance - b.balance : b.balance - a.balance;
      if (sort === "visits") return order === "asc" ? a.visits - b.visits : b.visits - a.visits;
      return 0; // já ordenado pelo Prisma (nome ou membro desde)
    });

  const exportQuery = new URLSearchParams();
  if (q) exportQuery.set("q", q);
  if (status !== "all") exportQuery.set("status", status);
  if (category !== "all") exportQuery.set("category", category);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-brand text-2xl">Membros</h1>
        <div className="flex gap-2">
          <Link
            href={`/admin/members/export?${exportQuery.toString()}`}
            className="btn btn-secondary"
          >
            Exportar CSV
          </Link>
          <Link href="/admin/members/new" className="btn btn-primary">
            Novo membro
          </Link>
        </div>
      </div>

      <form className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou e-mail..."
          className="input max-w-sm"
        />

        <select name="status" defaultValue={status} className="input w-auto">
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>

        <select name="category" defaultValue={category} className="input w-auto">
          <option value="all">Todas as categorias</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select name="sort" defaultValue={sort} className="input w-auto">
          {Object.entries(sortLabels).map(([value, label]) => (
            <option key={value} value={value}>
              Ordenar por {label.toLowerCase()}
            </option>
          ))}
        </select>

        <select name="order" defaultValue={order} className="input w-auto">
          <option value="asc">Crescente</option>
          <option value="desc">Decrescente</option>
        </select>

        <button type="submit" className="btn btn-secondary">
          Filtrar
        </button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="px-4 py-3 font-medium">Membro</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Membro desde</th>
              <th className="px-4 py-3 font-medium text-center">Visitas</th>
              <th className="px-4 py-3 font-medium text-right">Saldo</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ member, balance, visits: v }) => (
              <tr
                key={member.id}
                className="border-b border-border last:border-0 hover:bg-surface-2"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="flex items-center gap-3 hover:text-gold"
                  >
                    <Avatar name={member.name} photoUrl={member.photoUrl} size={32} />
                    <div>
                      <p>{member.name}</p>
                      <p className="text-muted text-xs">{member.email}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="badge bg-surface-2 text-muted">
                    {categoryLabels[member.category]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {format(member.memberSince, "MM/yyyy", { locale: ptBR })}
                </td>
                <td className="px-4 py-3 text-center">{v}</td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    balance < 0 ? "text-danger" : ""
                  }`}
                >
                  {formatCurrency(balance)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      member.active
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    {member.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  Nenhum membro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
