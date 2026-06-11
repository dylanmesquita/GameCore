import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { getCurrentUser } from "@/lib/auth";

/** DELETE /api/comments/:id — remove um comentário próprio. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
    }
    if (String(comment.user) !== me.id) {
      return NextResponse.json(
        { error: "Você só pode excluir seus próprios comentários." },
        { status: 403 }
      );
    }

    await comment.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[comments:DELETE]", err);
    return NextResponse.json({ error: "Erro ao excluir comentário." }, { status: 500 });
  }
}
