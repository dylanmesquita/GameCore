import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { getCurrentUser } from "@/lib/auth";

/** GET /api/comments?gameId=123 — lista os comentários de um jogo. */
export async function GET(req: NextRequest) {
  try {
    const gameId = Number(req.nextUrl.searchParams.get("gameId"));
    if (!gameId) {
      return NextResponse.json({ error: "gameId é obrigatório." }, { status: 400 });
    }

    await connectDB();
    const comments = await Comment.find({ gameId })
      .sort({ createdAt: -1 })
      .lean();

    const me = await getCurrentUser();

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: String(c._id),
        authorName: c.authorName,
        body: c.body,
        createdAt: c.createdAt,
        // permite que o front mostre o botão de excluir só para o dono
        isOwner: me ? String(c.user) === me.id : false,
      })),
    });
  } catch (err) {
    console.error("[comments:GET]", err);
    return NextResponse.json({ error: "Erro ao carregar comentários." }, { status: 500 });
  }
}

/** POST /api/comments — cria um comentário (requer login). */
export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json(
        { error: "Você precisa estar logado para comentar." },
        { status: 401 }
      );
    }

    const { gameId, body } = await req.json();
    if (!gameId || !body || !String(body).trim()) {
      return NextResponse.json(
        { error: "gameId e o texto do comentário são obrigatórios." },
        { status: 400 }
      );
    }

    await connectDB();
    const comment = await Comment.create({
      gameId: Number(gameId),
      user: me.id,
      authorName: me.name,
      body: String(body).trim(),
    });

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          authorName: comment.authorName,
          body: comment.body,
          createdAt: comment.createdAt,
          isOwner: true,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[comments:POST]", err);
    return NextResponse.json({ error: "Erro ao publicar comentário." }, { status: 500 });
  }
}
