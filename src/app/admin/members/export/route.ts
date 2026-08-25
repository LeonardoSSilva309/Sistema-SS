import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { getAllMemberBalances } from "@/lib/balance";
import { getAllMemberVisitCounts } from "@/lib/member-stats";
import { buildMemberWhere, categoryLabels, type MemberStatusFilter, type MemberCategoryFilter } from "@/lib/member-query";

function escapeCsvField(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  await requireStaff();

  const params = request.nextUrl.searchParams;
  const q = params.get("q") ?? undefined;
  const status = (params.get("status") as MemberStatusFilter) ?? "all";
  const category = (params.get("category") as MemberCategoryFilter) ?? "all";

  const where = buildMemberWhere({ q, status, category });

  const [members, balances, visits] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { name: "asc" } }),
    getAllMemberBalances(),
    getAllMemberVisitCounts(),
  ]);

  const header = [
    "Nome",
    "E-mail",
    "Telefone",
    "Categoria",
    "Aniversário",
    "Membro desde",
    "Visitas",
    "Saldo (R$)",
    "Status",
  ];

  const rows = members.map((member) => [
    member.name,
    member.email,
    member.phone ?? "",
    categoryLabels[member.category] ?? member.category,
    member.birthday ? format(member.birthday, "dd/MM") : "",
    format(member.memberSince, "dd/MM/yyyy"),
    String(visits[member.id] ?? 0),
    (balances[member.id] ?? 0).toFixed(2).replace(".", ","),
    member.active ? "Ativo" : "Inativo",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\n");

  const csvWithBom = String.fromCharCode(0xfeff) + csv;

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="membros-sweet-secrets.csv"`,
    },
  });
}
