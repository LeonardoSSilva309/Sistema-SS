import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { toggleTableActiveAction } from "../tables-actions";
import NewTableForm from "./new-table-form";

export default async function TablesPage() {
  await requireStaff();

  const tables = await prisma.restaurantTable.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-brand text-2xl mb-6">Mesas</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
            Cadastrar mesa
          </h2>
          <NewTableForm />
        </div>

        <div className="card p-6">
          <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
            Mesas cadastradas
          </h2>
          <div className="flex flex-col gap-3">
            {tables.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0"
              >
                <div>
                  <p>{t.name}</p>
                  <p className="text-muted">
                    {t.capacity} lugares{t.location ? ` · ${t.location}` : ""}
                  </p>
                </div>
                <form action={toggleTableActiveAction.bind(null, t.id)}>
                  <button
                    className={`badge ${
                      t.active
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    {t.active ? "Ativa" : "Inativa"}
                  </button>
                </form>
              </div>
            ))}
            {tables.length === 0 && (
              <p className="text-sm text-muted">Nenhuma mesa cadastrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
