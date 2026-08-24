import Link from "next/link";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-brand text-3xl tracking-wide text-gold">
            Sweet Secrets
          </Link>
          <p className="text-muted text-sm mt-2">Acesso de membros e equipe</p>
        </div>

        <div className="card p-6">
          <LoginForm callbackUrl={callbackUrl ?? "/"} />
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Esqueceu sua senha ou ainda não é membro? Fale com a equipe do Sweet
          Secrets.
        </p>
      </div>
    </main>
  );
}
