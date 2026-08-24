"use client";

import { useActionState } from "react";
import { createTableAction, type TableFormState } from "../tables-actions";

const initialState: TableFormState = {};

export default function NewTableForm() {
  const [state, formAction, pending] = useActionState(createTableAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm text-muted">
          Nome da mesa
        </label>
        <input id="name" name="name" className="input" required placeholder="Mesa 6" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="capacity" className="text-sm text-muted">
          Capacidade
        </label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          defaultValue={2}
          className="input"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="location" className="text-sm text-muted">
          Localização (opcional)
        </label>
        <input id="location" name="location" className="input" placeholder="Varanda" />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-2">
        {pending ? "Salvando..." : "Cadastrar mesa"}
      </button>
    </form>
  );
}
