"use client";

import { useActionState } from "react";
import Avatar from "@/components/avatar";
import {
  uploadMemberPhotoAction,
  removeMemberPhotoAction,
  type PhotoFormState,
} from "./photo-actions";

const initialState: PhotoFormState = {};

export default function PhotoUpload({
  memberId,
  name,
  photoUrl,
}: {
  memberId: string;
  name: string;
  photoUrl: string | null;
}) {
  const action = uploadMemberPhotoAction.bind(null, memberId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const removeAction = removeMemberPhotoAction.bind(null, memberId);

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} photoUrl={photoUrl} size={64} />
      <div className="flex flex-col gap-2">
        <form action={formAction} className="flex items-center gap-2">
          <input
            type="file"
            name="photo"
            accept="image/*"
            required
            className="text-xs text-muted file:btn file:btn-secondary file:text-xs file:mr-2"
          />
          <button type="submit" disabled={pending} className="btn btn-secondary text-xs">
            {pending ? "Enviando..." : "Enviar foto"}
          </button>
        </form>
        {photoUrl && (
          <form action={removeAction}>
            <button type="submit" className="text-xs text-danger hover:underline">
              Remover foto
            </button>
          </form>
        )}
        {state.error && <p className="text-xs text-danger">{state.error}</p>}
      </div>
    </div>
  );
}
