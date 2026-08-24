"use client";

import { useActionState } from "react";
import { sendDigestNowAction, type DigestResultState } from "./actions";

const initialState: DigestResultState = {};

export default function SendDigestButton() {
  const [state, formAction, pending] = useActionState(
    async () => sendDigestNowAction(),
    initialState
  );

  return (
    <form action={formAction} className="flex items-center gap-3">
      <button type="submit" disabled={pending} className="btn btn-secondary">
        {pending ? "Enviando..." : "Enviar resumo semanal agora"}
      </button>
      {state.message && <span className="text-xs text-success">{state.message}</span>}
      {state.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
