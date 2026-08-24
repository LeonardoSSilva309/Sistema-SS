import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { logoutAction } from "@/app/actions";

const navItems = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/reservations", label: "Reservas" },
  { href: "/admin/events", label: "Agenda / Eventos" },
  { href: "/admin/members", label: "Membros" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();

  return (
    <div className="flex-1 flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-5 py-5 border-b border-border">
          <Link href="/" className="font-brand text-xl text-gold">
            Sweet Secrets
          </Link>
          <p className="text-xs text-muted mt-0.5">Painel da equipe</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm text-foreground/90 hover:bg-surface-2 hover:text-gold transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {user.role === "ADMIN" && (
            <Link
              href="/admin/staff"
              className="px-3 py-2 rounded-lg text-sm text-foreground/90 hover:bg-surface-2 hover:text-gold transition-colors"
            >
              Equipe
            </Link>
          )}
        </nav>
        <div className="px-5 py-4 border-t border-border">
          <p className="text-sm truncate">{user.name}</p>
          <p className="text-xs text-muted mb-3">
            {user.role === "ADMIN" ? "Administrador" : "Equipe"}
          </p>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-secondary w-full text-sm">
              Sair
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1 bg-background">
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
