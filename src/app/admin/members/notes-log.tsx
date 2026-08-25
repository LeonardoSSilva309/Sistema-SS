"use client";

import { useActionState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { addMemberNoteAction, type NoteFormState } from "./notes-actions";

const initialState: NoteFormState = {};

type Note = {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: { name: string } | null;
};

export default function NotesLog({
  memberId,
  notes,
}: {
  memberId: string;
  notes: Note[];
}) {
  const action = addMemberNoteAction.bind(null, memberId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div>
      <form action={formAction} className="flex flex-col gap-2 mb-4">
        <textarea
          name="content"
          rows={2}
          className="input"
          placeholder="Ex: pediu mesa na varanda para o aniversário..."
          required
        />
        {state.error && <p className="text-xs text-danger">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="btn btn-secondary text-sm self-start"
        >
          {pending ? "Salvando..." : "Adicionar observação"}
        </button>
      </form>

      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
        {notes.length === 0 && (
          <p className="text-sm text-muted">Nenhuma observação registrada ainda.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="text-sm border-b border-border pb-2 last:border-0">
            <p>{note.content}</p>
            <p className="text-xs text-muted mt-0.5">
              {format(note.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              {note.createdBy ? ` · ${note.createdBy.name}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
