"use client";

import { useActionState } from "react";
import type { EventFormState } from "./actions";

const initialState: EventFormState = {};

function toDateTimeLocal(value?: Date | null) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

type Props = {
  action: (state: EventFormState, formData: FormData) => Promise<EventFormState>;
  defaultValues?: {
    title?: string;
    description?: string | null;
    type?: "INTERNAL" | "EXTERNAL";
    startDate?: Date | null;
    endDate?: Date | null;
    location?: string | null;
    isPublic?: boolean;
  };
  submitLabel?: string;
};

export default function EventForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm text-muted">
          Título
        </label>
        <input
          id="title"
          name="title"
          className="input"
          defaultValue={defaultValues?.title}
          required
        />
        {state.fieldErrors?.title && (
          <p className="text-xs text-danger">{state.fieldErrors.title}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm text-muted">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input"
          defaultValue={defaultValues?.description ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="text-sm text-muted">
            Tipo
          </label>
          <select
            id="type"
            name="type"
            className="input"
            defaultValue={defaultValues?.type ?? "INTERNAL"}
          >
            <option value="INTERNAL">Interno (feito pela casa)</option>
            <option value="EXTERNAL">Externo (espaço locado / fechado)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="location" className="text-sm text-muted">
            Local (opcional)
          </label>
          <input
            id="location"
            name="location"
            className="input"
            defaultValue={defaultValues?.location ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="startDate" className="text-sm text-muted">
            Início
          </label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            className="input"
            defaultValue={toDateTimeLocal(defaultValues?.startDate)}
            required
          />
          {state.fieldErrors?.startDate && (
            <p className="text-xs text-danger">{state.fieldErrors.startDate}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="endDate" className="text-sm text-muted">
            Fim (opcional)
          </label>
          <input
            id="endDate"
            name="endDate"
            type="datetime-local"
            className="input"
            defaultValue={toDateTimeLocal(defaultValues?.endDate)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="isPublic"
          defaultChecked={defaultValues?.isPublic ?? true}
          className="accent-[var(--gold)]"
        />
        Visível para os membros (portal e avisos semanais)
      </label>

      <button type="submit" disabled={pending} className="btn btn-primary mt-2">
        {pending ? "Salvando..." : submitLabel ?? "Salvar"}
      </button>
    </form>
  );
}
