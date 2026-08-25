import { prisma } from "@/lib/prisma";

export async function getMemberVisitCount(memberId: string) {
  return prisma.reservation.count({
    where: { memberId, status: "COMPLETED" },
  });
}

export async function getAllMemberVisitCounts(): Promise<Record<string, number>> {
  const rows = await prisma.reservation.groupBy({
    by: ["memberId"],
    where: { status: "COMPLETED" },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.memberId] = row._count._all;
  }
  return counts;
}
