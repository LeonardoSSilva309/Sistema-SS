import type { Prisma } from "@prisma/client";

export type MemberStatusFilter = "all" | "active" | "inactive";
export type MemberCategoryFilter = "all" | "REGULAR" | "VIP" | "FOUNDER" | "GUEST";
export type MemberSort = "name" | "balance" | "memberSince" | "visits";

export type MemberQueryParams = {
  q?: string;
  status?: MemberStatusFilter;
  category?: MemberCategoryFilter;
  sort?: MemberSort;
  order?: "asc" | "desc";
};

export function buildMemberWhere(params: MemberQueryParams): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { role: "MEMBER" };

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
    ];
  }

  if (params.status === "active") where.active = true;
  if (params.status === "inactive") where.active = false;

  if (params.category && params.category !== "all") {
    where.category = params.category;
  }

  return where;
}

export const categoryLabels: Record<string, string> = {
  REGULAR: "Regular",
  VIP: "VIP",
  FOUNDER: "Fundador",
  GUEST: "Convidado",
};

export const sortLabels: Record<MemberSort, string> = {
  name: "Nome",
  balance: "Saldo",
  memberSince: "Membro desde",
  visits: "Visitas",
};
