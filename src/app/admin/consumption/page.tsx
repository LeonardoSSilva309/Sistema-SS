import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { getAllMemberBalances, formatCurrency } from "@/lib/balance";

export default async function ConsumptionPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaff();
  const { q } = await searchParams;

  const [members, balances] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "MEMBER",
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, active: true },
    }),
    getAllMemberBalances(),
  ]);

  return (
    <div>
      <h1 className="font-brand text-2xl mb-6">Consumação</h1>

      <form className="mb-5">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou e-mail..."
          className="input max-w-sm"
        />
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="px-4 py-3 font-medium">Membro</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const balance = balances[member.id] ?? 0;
              return (
                <tr
                  key={member.id}
                  className="border-b border-border last:border-0 hover:bg-surface-2"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="hover:text-gold"
                    >
                      {member.name}
                    </Link>
                    <p className="text-muted text-xs">{member.email}</p>
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
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      balance < 0 ? "text-danger" : ""
                    }`}
                  >
                    {formatCurrency(balance)}
                  </td>
                </tr>
              );
            })}
            {members.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted">
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
