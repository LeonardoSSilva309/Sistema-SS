import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function HomePage() {
  const user = await getCurrentUser();

  const upcomingEvents = await prisma.event.findMany({
    where: { isPublic: true, startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  const dashboardHref =
    user?.role === "ADMIN" || user?.role === "STAFF" ? "/admin" : "/portal";

  return (
    <main className="flex-1 flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 py-6">
        <span className="font-brand text-2xl tracking-wide text-gold">
          Sweet Secrets
        </span>
        {user ? (
          <Link href={dashboardHref} className="btn btn-secondary">
            Minha área
          </Link>
        ) : (
          <Link href="/login" className="btn btn-primary">
            Entrar
          </Link>
        )}
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <h1 className="font-brand text-4xl sm:text-5xl max-w-2xl leading-tight">
          O clube da casa, com reservas e agenda sempre à mão.
        </h1>
        <p className="text-muted mt-4 max-w-xl">
          Acompanhe reservas, eventos internos e externos da casa, e receba
          avisos toda semana sobre o que vai rolar no Sweet Secrets.
        </p>
        {!user && (
          <Link href="/login" className="btn btn-primary mt-8">
            Acessar minha conta
          </Link>
        )}
      </section>

      <section className="px-6 sm:px-10 pb-16">
        <h2 className="font-brand text-2xl mb-6 text-center">Próximos eventos</h2>
        <div className="max-w-2xl mx-auto grid gap-3">
          {upcomingEvents.length === 0 && (
            <p className="text-muted text-center text-sm">
              Nenhum evento divulgado no momento.
            </p>
          )}
          {upcomingEvents.map((event) => (
            <div key={event.id} className="card p-4 flex items-start gap-4">
              <div className="text-gold font-brand text-lg w-16 shrink-0 text-center">
                {format(event.startDate, "dd/MM", { locale: ptBR })}
              </div>
              <div>
                <p className="font-medium">{event.title}</p>
                {event.description && (
                  <p className="text-sm text-muted mt-0.5">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-muted py-6 border-t border-border">
        Sweet Secrets — sistema interno de reservas e eventos
      </footer>
    </main>
  );
}
