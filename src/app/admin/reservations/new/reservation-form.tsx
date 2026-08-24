"use client";

import { useActionState } from "react";
import { createReservationAction, type ReservationFormState } from "../actions";

const initialState: ReservationFormState = {};

type Member = { id: string; name: string; email: string };
type Table = { id: string; name: string; capacity: number };

export default function ReservationForm({
  members,
  tables,
}: {
  members: Member[];
  tables: Table[];
}) {
  const [state, formAction, pending] = useActionState(
    createReservationAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="memberId" className="text-sm text-muted">
          Membro
        </label>
        <select id="memberId" name="memberId" className="input" required>
          <option value="">Selecione...</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>
        {state.fieldErrors?.memberId && (
          <p className="text-xs text-danger">{state.fieldErrors.memberId}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className="text-sm text-muted">
            Data
          </label>
          <input id="date" name="date" type="date" className="input" required />
          {state.fieldErrors?.date && (
            <p className="text-xs text-danger">{state.fieldErrors.date}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="time" className="text-sm text-muted">
            Horário
          </label>
          <input id="time" name="time" type="time" className="input" required />
          {state.fieldErrors?.time && (
            <p className="text-xs text-danger">{state.fieldErrors.time}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="partySize" className="text-sm text-muted">
            Nº de pessoas
          </label>
          <input
            id="partySize"
            name="partySize"
            type="number"
            min={1}
            defaultValue={2}
            className="input"
            required
          />
          {state.fieldErrors?.partySize && (
            <p className="text-xs text-danger">{state.fieldErrors.partySize}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tableId" className="text-sm text-muted">
            Mesa (opcional)
          </label>
          <select id="tableId" name="tableId" className="input">
            <option value="">A definir</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.capacity} lugares)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm text-muted">
          Observações
        </label>
        <textarea id="notes" name="notes" className="input" rows={3} />
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary mt-2">
        {pending ? "Salvando..." : "Criar reserva"}
      </button>
    </form>
  );
}
