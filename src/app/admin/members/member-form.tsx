"use client";

import { useActionState } from "react";
import type { MemberFormState } from "./actions";

const initialState: MemberFormState = {};

const categoryLabels: Record<string, string> = {
  REGULAR: "Regular",
  VIP: "VIP",
  FOUNDER: "Fundador",
  GUEST: "Convidado",
};

function toDateInput(value?: Date | null) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type Props = {
  action: (state: MemberFormState, formData: FormData) => Promise<MemberFormState>;
  defaultValues?: {
    name?: string;
    email?: string;
    phone?: string | null;
    notes?: string | null;
    category?: string;
    birthday?: Date | null;
    monthlyFee?: number | null;
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

      <div className="grid grid-cols-2 gap-4">
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
          <label htmlFor="birthday" className="text-sm text-muted">
            Aniversário
          </label>
          <input
            id="birthday"
            name="birthday"
            type="date"
            className="input"
            defaultValue={toDateInput(defaultValues?.birthday)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm text-muted">
            Categoria
          </label>
          <select
            id="category"
            name="category"
            className="input"
            defaultValue={defaultValues?.category ?? "REGULAR"}
          >
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="monthlyFee" className="text-sm text-muted">
            Mensalidade (R$)
          </label>
          <input
            id="monthlyFee"
            name="monthlyFee"
            type="number"
            min={0}
            step={0.01}
            className="input"
            placeholder="Opcional"
            defaultValue={defaultValues?.monthlyFee ?? ""}
          />
        </div>
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
