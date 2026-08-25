import Link from "next/link";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-brand text-3xl tracking-wide text-gold">
            Sweet Secrets
          </Link>
          <p className="text-muted text-sm mt-2">Esqueceu sua senha?</p>
        </div>

        <div className="card p-6">
          <ForgotPasswordForm />
        </div>

        <p className="text-center text-xs text-muted mt-6">
          <Link href="/login" className="hover:text-gold">
            Voltar para o login
          </Link>
        </p>
      </div>
    </main>
  );
}
