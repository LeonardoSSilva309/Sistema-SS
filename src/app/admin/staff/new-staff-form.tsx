"use client";

import { useActionState } from "react";
import { createStaffAction, type StaffFormState } from "./actions";

const initialState: StaffFormState = {};

export default function NewStaffForm() {
  const [state, formAction, pending] = useActionState(createStaffAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm text-muted">
          Nome completo
        </label>
        <input id="name" name="name" className="input" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-muted">
          E-mail
        </label>
        <input id="email" name="email" type="email" className="input" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="role" className="text-sm text-muted">
          Função
        </label>
        <select id="role" name="role" className="input" defaultValue="STAFF">
          <option value="STAFF">Equipe</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-2">
        {pending ? "Salvando..." : "Adicionar"}
      </button>
    </form>
  );
}
