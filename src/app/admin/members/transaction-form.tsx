"use client";

import { useActionState } from "react";
import { addTransactionAction, type TransactionFormState } from "./transactions-actions";

const initialState: TransactionFormState = {};

export default function TransactionForm({ memberId }: { memberId: string }) {
  const action = addTransactionAction.bind(null, memberId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <label className="flex items-center gap-1.5 text-sm">
          <input type="radio" name="type" value="CREDIT" defaultChecked className="accent-[var(--gold)]" />
          Recarga
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="radio" name="type" value="DEBIT" className="accent-[var(--gold)]" />
          Consumo
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className="text-sm text-muted">
          Valor (R$)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min={0.01}
          step={0.01}
          className="input"
          required
        />
        {state.fieldErrors?.amount && (
          <p className="text-xs text-danger">{state.fieldErrors.amount}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm text-muted">
          Descrição (opcional)
        </label>
        <input
          id="description"
          name="description"
          className="input"
          placeholder="Ex: recarga no balcão, bebidas da mesa 4..."
        />
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary mt-1">
        {pending ? "Lançando..." : "Lançar"}
      </button>
    </form>
  );
}
