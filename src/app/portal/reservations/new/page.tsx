import { requireUser } from "@/lib/session";
import RequestReservationForm from "./request-form";

export default async function NewPortalReservationPage() {
  await requireUser();

  return (
    <div>
      <h1 className="font-brand text-2xl mb-2">Solicitar reserva</h1>
      <p className="text-muted text-sm mb-6">
        Sua solicitação ficará pendente até a confirmação da equipe.
      </p>
      <div className="card p-6 max-w-md">
        <RequestReservationForm />
      </div>
    </div>
  );
}
