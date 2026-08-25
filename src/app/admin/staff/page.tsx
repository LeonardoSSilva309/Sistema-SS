import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { toggleStaffActiveAction } from "./actions";
import NewStaffForm from "./new-staff-form";
import AccessLinkButton from "../access-link-button";

export default async function StaffPage() {
  const admin = await requireAdmin();

  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-brand text-2xl mb-6">Equipe</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
            Adicionar à equipe
          </h2>
          <NewStaffForm />
        </div>

        <div className="card p-6">
          <h2 className="text-sm text-muted mb-4 uppercase tracking-wide">
            Contas da equipe
          </h2>
          <div className="flex flex-col gap-3">
            {staff.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-2 text-sm border-b border-border pb-3 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p>{s.name}</p>
                    <p className="text-muted">
                      {s.email} · {s.role === "ADMIN" ? "Administrador" : "Equipe"}
                    </p>
                  </div>
                  {s.id !== admin.id && (
                    <form action={toggleStaffActiveAction.bind(null, s.id)}>
                      <button
                        className={`badge ${
                          s.active
                            ? "bg-success/15 text-success"
                            : "bg-danger/15 text-danger"
                        }`}
                      >
                        {s.active ? "Ativo" : "Inativo"}
                      </button>
                    </form>
                  )}
                </div>
                <AccessLinkButton userId={s.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
