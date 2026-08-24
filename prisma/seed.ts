import { PrismaClient, Role, EventType, ReservationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sweetsecrets.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@sweetsecrets.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const staffPassword = await bcrypt.hash("staff123", 10);
  await prisma.user.upsert({
    where: { email: "staff@sweetsecrets.com" },
    update: {},
    create: {
      name: "Equipe Sweet Secrets",
      email: "staff@sweetsecrets.com",
      passwordHash: staffPassword,
      role: Role.STAFF,
    },
  });

  const memberPassword = await bcrypt.hash("membro123", 10);
  const member = await prisma.user.upsert({
    where: { email: "membro@sweetsecrets.com" },
    update: {},
    create: {
      name: "Membro Exemplo",
      email: "membro@sweetsecrets.com",
      passwordHash: memberPassword,
      role: Role.MEMBER,
      phone: "+55 11 90000-0000",
    },
  });

  const tableNames = [
    { name: "Mesa 1", capacity: 2, location: "Salão principal" },
    { name: "Mesa 2", capacity: 4, location: "Salão principal" },
    { name: "Mesa 3", capacity: 4, location: "Varanda" },
    { name: "Mesa 4", capacity: 6, location: "Varanda" },
    { name: "Mesa VIP", capacity: 8, location: "Sala reservada" },
  ];

  for (const t of tableNames) {
    await prisma.restaurantTable.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
  }

  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  await prisma.event.createMany({
    data: [
      {
        title: "Noite de Jazz ao Vivo",
        description: "Apresentação de jazz com trio convidado.",
        type: EventType.INTERNAL,
        startDate: inDays(2),
        location: "Salão principal",
        isPublic: true,
        createdById: admin.id,
      },
      {
        title: "Degustação de Vinhos",
        description: "Evento fechado para sócios, com sommelier convidado.",
        type: EventType.INTERNAL,
        startDate: inDays(4),
        location: "Sala reservada",
        isPublic: true,
        createdById: admin.id,
      },
      {
        title: "Evento Corporativo — Empresa XPTO",
        description: "Espaço reservado para evento externo. Casa fecha para novos sócios neste dia.",
        type: EventType.EXTERNAL,
        startDate: inDays(6),
        isPublic: true,
        createdById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  const table = await prisma.restaurantTable.findFirst({ where: { name: "Mesa 2" } });
  await prisma.reservation.create({
    data: {
      memberId: member.id,
      tableId: table?.id,
      date: inDays(3),
      time: "20:00",
      partySize: 4,
      status: ReservationStatus.CONFIRMED,
      createdById: admin.id,
    },
  });

  console.log("Seed concluído.");
  console.log("Login admin: admin@sweetsecrets.com / admin123");
  console.log("Login staff: staff@sweetsecrets.com / staff123");
  console.log("Login membro: membro@sweetsecrets.com / membro123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
