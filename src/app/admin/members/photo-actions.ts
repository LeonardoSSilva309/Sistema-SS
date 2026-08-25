"use server";

import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";

export type PhotoFormState = {
  error?: string;
};

const MAX_SIZE = 4 * 1024 * 1024;

export async function uploadMemberPhotoAction(
  memberId: string,
  _prevState: PhotoFormState,
  formData: FormData
): Promise<PhotoFormState> {
  await requireStaff();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione uma imagem." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Envie um arquivo de imagem." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "Imagem muito grande (máximo 4MB)." };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      error:
        "Armazenamento de imagens não configurado. Ative o Vercel Blob no projeto para habilitar fotos.",
    };
  }

  try {
    const extension = file.name.split(".").pop() ?? "jpg";
    const blob = await put(`members/${memberId}-${Date.now()}.${extension}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: { photoUrl: true },
    });

    await prisma.user.update({
      where: { id: memberId },
      data: { photoUrl: blob.url },
    });

    if (member?.photoUrl) {
      await del(member.photoUrl).catch(() => {});
    }

    revalidatePath(`/admin/members/${memberId}`);
    revalidatePath("/admin/members");
    return {};
  } catch {
    return { error: "Não foi possível enviar a imagem. Tente novamente." };
  }
}

export async function removeMemberPhotoAction(memberId: string) {
  await requireStaff();

  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: { photoUrl: true },
  });
  if (!member?.photoUrl) return;

  await prisma.user.update({ where: { id: memberId }, data: { photoUrl: null } });
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await del(member.photoUrl).catch(() => {});
  }

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/members");
}
