import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import ReservationForm from "./reservation-form";

export default async function NewReservationPage() {
  await requireStaff();

  const [members, tables] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MEMBER", active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.restaurantTable.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="font-brand text-2xl mb-6">Nova reserva</h1>
      <div className="card p-6 max-w-lg">
        <ReservationForm members={members} tables={tables} />
      </div>
    </div>
  );
}
