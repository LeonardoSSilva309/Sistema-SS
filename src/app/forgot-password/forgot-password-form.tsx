"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  if (state.submitted) {
    return (
      <p className="text-sm text-center">
        Se houver uma conta com esse e-mail, enviamos um link para redefinir a
        senha. Confira sua caixa de entrada (e o spam).
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-muted">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="voce@exemplo.com"
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-danger">{state.fieldErrors.email}</p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary mt-2">
        {pending ? "Enviando..." : "Enviar link de redefinição"}
      </button>
    </form>
  );
}
