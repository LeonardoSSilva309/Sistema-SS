import Link from "next/link";
import { requireUser } from "@/lib/session";
import { logoutAction } from "@/app/actions";

const navItems = [
  { href: "/portal", label: "Agenda da semana" },
  { href: "/portal/reservations", label: "Minhas reservas" },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-brand text-xl text-gold">
            Sweet Secrets
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-foreground/90 hover:text-gold transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <span className="text-sm text-muted hidden sm:inline">{user.name}</span>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-secondary text-sm">
                Sair
              </button>
            </form>
          </div>
        </div>
        <nav className="flex sm:hidden gap-4 px-6 pb-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-gold">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
