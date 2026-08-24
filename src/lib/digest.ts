import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function buildDigestHtml(memberName: string, events: { title: string; description: string | null; type: string; startDate: Date; location: string | null }[]) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const rows = events
    .map(
      (e) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #2a2830;">
            <div style="color:#c9a15a;font-size:13px;font-weight:600;">
              ${format(e.startDate, "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
            </div>
            <div style="color:#f3ede0;font-size:15px;font-weight:600;margin-top:2px;">
              ${e.title} ${e.type === "EXTERNAL" ? "(evento externo)" : ""}
            </div>
            ${e.description ? `<div style="color:#a79f8f;font-size:13px;margin-top:2px;">${e.description}</div>` : ""}
            ${e.location ? `<div style="color:#a79f8f;font-size:12px;margin-top:2px;">${e.location}</div>` : ""}
          </td>
        </tr>`
    )
    .join("");

  return `
    <div style="background:#0b0b0d;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#16151a;border-radius:12px;padding:28px;border:1px solid #2a2830;">
        <p style="color:#c9a15a;font-size:22px;font-family:Georgia,serif;margin:0 0 4px;">Sweet Secrets</p>
        <p style="color:#a79f8f;font-size:13px;margin:0 0 20px;">Agenda da semana</p>
        <p style="color:#f3ede0;font-size:14px;">Olá, ${memberName}!</p>
        <p style="color:#a79f8f;font-size:13px;margin-bottom:16px;">
          Confira o que vai rolar na casa nos próximos dias:
        </p>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        ${
          appUrl
            ? `<p style="margin-top:24px;"><a href="${appUrl}/portal" style="color:#1a1409;background:#c9a15a;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Ver na área do membro</a></p>`
            : ""
        }
      </div>
    </div>`;
}

export async function sendWeeklyDigest() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = addDays(today, 7);

  const events = await prisma.event.findMany({
    where: { isPublic: true, startDate: { gte: today, lt: weekEnd } },
    orderBy: { startDate: "asc" },
  });

  if (events.length === 0) {
    await prisma.digestLog.create({
      data: { weekStart: today, weekEnd, recipients: 0, eventCount: 0 },
    });
    return { sent: 0, eventCount: 0 };
  }

  const members = await prisma.user.findMany({
    where: { role: "MEMBER", active: true },
    select: { id: true, name: true, email: true },
  });

  const results = await Promise.allSettled(
    members.map((member) =>
      sendEmail({
        to: member.email,
        subject: "Sweet Secrets — o que vai rolar essa semana",
        html: buildDigestHtml(member.name, events),
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;

  await prisma.digestLog.create({
    data: { weekStart: today, weekEnd, recipients: sent, eventCount: events.length },
  });

  return { sent, eventCount: events.length };
}
