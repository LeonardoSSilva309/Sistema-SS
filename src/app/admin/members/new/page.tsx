import { requireStaff } from "@/lib/session";
import { createMemberAction } from "../actions";
import MemberForm from "../member-form";

export default async function NewMemberPage() {
  await requireStaff();

  return (
    <div>
      <h1 className="font-brand text-2xl mb-6">Novo membro</h1>
      <div className="card p-6">
        <MemberForm action={createMemberAction} submitLabel="Cadastrar membro" />
      </div>
    </div>
  );
}
