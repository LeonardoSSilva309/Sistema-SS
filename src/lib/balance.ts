import { prisma } from "@/lib/prisma";

export async function getMemberBalance(memberId: string) {
  const [credit, debit] = await Promise.all([
    prisma.consumptionTransaction.aggregate({
      where: { memberId, type: "CREDIT" },
      _sum: { amount: true },
    }),
    prisma.consumptionTransaction.aggregate({
      where: { memberId, type: "DEBIT" },
      _sum: { amount: true },
    }),
  ]);

  return (credit._sum.amount?.toNumber() ?? 0) - (debit._sum.amount?.toNumber() ?? 0);
}

export async function getAllMemberBalances(): Promise<Record<string, number>> {
  const sums = await prisma.consumptionTransaction.groupBy({
    by: ["memberId", "type"],
    _sum: { amount: true },
  });

  const balances: Record<string, number> = {};
  for (const row of sums) {
    const value = row._sum.amount?.toNumber() ?? 0;
    const delta = row.type === "CREDIT" ? value : -value;
    balances[row.memberId] = (balances[row.memberId] ?? 0) + delta;
  }
  return balances;
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
