"use client";

import { useActionState } from "react";
import type { MemberFormState } from "./actions";

const initialState: MemberFormState = {};

type Props = {
  action: (state: MemberFormState, formData: FormData) => Promise<MemberFormState>;
  defaultValues?: {
    name?: string;
    email?: string;
    phone?: string | null;
    notes?: string | null;
  };
  submitLabel?: string;
};

export default function MemberForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm text-muted">
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          className="input"
          defaultValue={defaultValues?.name}
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-danger">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-muted">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          defaultValue={defaultValues?.email}
          required
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-danger">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm text-muted">
          Telefone
        </label>
        <input
          id="phone"
          name="phone"
          className="input"
          defaultValue={defaultValues?.phone ?? ""}
          placeholder="+55 11 90000-0000"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm text-muted">
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          className="input"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
        />
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary mt-2">
        {pending ? "Salvando..." : submitLabel ?? "Salvar"}
      </button>
    </form>
  );
}
