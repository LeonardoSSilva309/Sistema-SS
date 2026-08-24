"use client";

import { useActionState } from "react";
import {
  requestReservationAction,
  type ReservationRequestState,
} from "../actions";

const initialState: ReservationRequestState = {};

export default function RequestReservationForm() {
  const [state, formAction, pending] = useActionState(
    requestReservationAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
        <label htmlFor="notes" className="text-sm text-muted">
          Observações (opcional)
        </label>
        <textarea id="notes" name="notes" className="input" rows={3} />
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary mt-2">
        {pending ? "Enviando..." : "Solicitar reserva"}
      </button>
    </form>
  );
}
