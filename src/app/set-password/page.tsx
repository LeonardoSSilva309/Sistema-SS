import Link from "next/link";
import { getUserByResetToken } from "@/lib/password-reset";
import SetPasswordForm from "./set-password-form";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const user = token ? await getUserByResetToken(token) : null;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-brand text-3xl tracking-wide text-gold">
            Sweet Secrets
          </Link>
          <p className="text-muted text-sm mt-2">Defina sua senha de acesso</p>
        </div>

        <div className="card p-6">
          {!token || !user ? (
            <p className="text-sm text-danger text-center">
              Link inválido ou expirado. Peça um novo link à equipe do Sweet
              Secrets.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted mb-4">
                Olá, {user.name.split(" ")[0]}! Crie uma senha para acessar sua
                conta.
              </p>
              <SetPasswordForm token={token} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
