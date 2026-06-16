import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { Rating } from "@/models/Rating";

/**
 * GET /api/community — feed da comunidade:
 *  - recentComments: últimos comentários publicados (qualquer jogo);
 *  - topRated: jogos com melhor média da comunidade GameCore.
 * Os nomes/imagens dos jogos são resolvidos no cliente (RAWG) a partir do gameId.
 */
export async function GET() {
  try {
    await connectDB();

    const [recentComments, topRated] = await Promise.all([
      Comment.find().sort({ createdAt: -1 }).limit(20).lean(),
      Rating.aggregate([
        { $group: { _id: "$gameId", average: { $avg: "$value" }, count: { $sum: 1 } } },
        { $sort: { average: -1, count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    return NextResponse.json({
      recentComments: recentComments.map((c) => ({
        id: String(c._id),
        gameId: c.gameId,
        authorName: c.authorName,
        body: c.body,
        createdAt: c.createdAt,
      })),
      topRated: topRated.map((t) => ({
        gameId: t._id,
        average: Math.round((t.average || 0) * 10) / 10,
        count: t.count,
      })),
    });
  } catch (err) {
    console.error("[community:GET]", err);
    return NextResponse.json({ error: "Erro ao carregar a comunidade." }, { status: 500 });
  }
}
