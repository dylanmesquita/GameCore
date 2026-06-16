import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Rating } from "@/models/Rating";
import { getCurrentUser } from "@/lib/auth";

/** Calcula média, total de votos e a nota do usuário atual para um jogo. */
async function summarize(gameId: number, userId?: string) {
  const agg = await Rating.aggregate([
    { $match: { gameId } },
    { $group: { _id: "$gameId", average: { $avg: "$value" }, count: { $sum: 1 } } },
  ]);
  const stats = agg[0] || { average: 0, count: 0 };

  let userRating = 0;
  if (userId) {
    const mine = await Rating.findOne({ gameId, user: userId }).lean();
    userRating = mine?.value || 0;
  }

  return {
    average: Math.round((stats.average || 0) * 10) / 10,
    count: stats.count || 0,
    userRating,
  };
}

/** GET /api/ratings?gameId=123 — média da comunidade + nota do usuário logado. */
export async function GET(req: NextRequest) {
  try {
    const gameId = Number(req.nextUrl.searchParams.get("gameId"));
    if (!gameId) {
      return NextResponse.json({ error: "gameId é obrigatório." }, { status: 400 });
    }

    await connectDB();
    const me = await getCurrentUser();
    return NextResponse.json(await summarize(gameId, me?.id));
  } catch (err) {
    console.error("[ratings:GET]", err);
    return NextResponse.json({ error: "Erro ao carregar avaliações." }, { status: 500 });
  }
}

/**
 * POST /api/ratings — define a nota do usuário para um jogo (1 a 5).
 * Body: { gameId, value }. value 0 (ou ausente) remove a avaliação.
 * Retorna o resumo atualizado { average, count, userRating }.
 */
export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json(
        { error: "Você precisa estar logado para avaliar." },
        { status: 401 }
      );
    }

    const { gameId, value } = await req.json();
    const gid = Number(gameId);
    const val = Number(value);
    if (!gid) {
      return NextResponse.json({ error: "gameId é obrigatório." }, { status: 400 });
    }

    await connectDB();

    if (!val) {
      // value 0/null => remove a avaliação do usuário.
      await Rating.deleteOne({ gameId: gid, user: me.id });
    } else {
      if (val < 1 || val > 5) {
        return NextResponse.json({ error: "A nota deve ser de 1 a 5." }, { status: 400 });
      }
      await Rating.findOneAndUpdate(
        { gameId: gid, user: me.id },
        { $set: { value: val } },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json(await summarize(gid, me.id));
  } catch (err) {
    console.error("[ratings:POST]", err);
    return NextResponse.json({ error: "Erro ao salvar avaliação." }, { status: 500 });
  }
}
