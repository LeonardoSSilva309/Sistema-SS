"use client";

import { useActionState, useState } from "react";
import { generateAccessLinkAction, type AccessLinkState } from "./access-link-actions";

const initialState: AccessLinkState = {};

export default function AccessLinkButton({ userId }: { userId: string }) {
  const action = async () => generateAccessLinkAction(userId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!state.url) return;
    try {
      await navigator.clipboard.writeText(state.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível — o campo abaixo já permite copiar manualmente
    }
  }

  return (
    <div>
      <form action={formAction}>
        <button type="submit" disabled={pending} className="btn btn-secondary text-sm">
          {pending ? "Gerando..." : "Gerar link de acesso"}
        </button>
      </form>

      {state.url && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs text-muted">
            Válido por 48h. Envie por WhatsApp ou e-mail para a pessoa definir a
            própria senha.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={state.url}
              onFocus={(e) => e.currentTarget.select()}
              className="input text-xs"
            />
            <button type="button" onClick={copy} className="btn btn-secondary text-sm shrink-0">
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      {state.error && <p className="text-sm text-danger mt-2">{state.error}</p>}
    </div>
  );
}
