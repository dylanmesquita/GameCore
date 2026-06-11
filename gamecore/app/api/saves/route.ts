import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

/** GET /api/saves — lista a biblioteca (jogos salvos) do usuário logado. */
export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ saves: [] }, { status: 200 });
    }

    await connectDB();
    const user = await User.findById(me.id).lean();
    const saves = (user?.savedGames || [])
      .slice()
      .sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt));

    return NextResponse.json({ saves });
  } catch (err) {
    console.error("[saves:GET]", err);
    return NextResponse.json({ error: "Erro ao carregar biblioteca." }, { status: 500 });
  }
}

/**
 * POST /api/saves — alterna (salva/remove) um jogo na biblioteca.
 * Body: { gameId, name, background_image, rating }
 * Retorna { saved: boolean }.
 */
export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json(
        { error: "Você precisa estar logado para salvar jogos." },
        { status: 401 }
      );
    }

    const { gameId, name, background_image, rating } = await req.json();
    if (!gameId) {
      return NextResponse.json({ error: "gameId é obrigatório." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(me.id);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const idx = user.savedGames.findIndex((g) => g.gameId === Number(gameId));
    let saved: boolean;

    if (idx >= 0) {
      user.savedGames.splice(idx, 1);
      saved = false;
    } else {
      user.savedGames.push({
        gameId: Number(gameId),
        name: name || "Jogo",
        background_image: background_image || "",
        rating: typeof rating === "number" ? rating : 0,
        addedAt: new Date(),
      });
      saved = true;
    }

    await user.save();
    return NextResponse.json({ saved });
  } catch (err) {
    console.error("[saves:POST]", err);
    return NextResponse.json({ error: "Erro ao salvar jogo." }, { status: 500 });
  }
}
