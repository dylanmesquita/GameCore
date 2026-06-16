import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Rating } from "@/models/Rating";
import { Comment } from "@/models/Comment";
import { getCurrentUser, signToken, setAuthCookie } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** GET /api/profile — dados do perfil + estatísticas do usuário logado. */
export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(me.id).lean();
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const [ratings, comments] = await Promise.all([
      Rating.countDocuments({ user: me.id }),
      Comment.countDocuments({ user: me.id }),
    ]);

    return NextResponse.json({
      profile: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        stats: {
          saved: user.savedGames?.length || 0,
          ratings,
          comments,
        },
      },
    });
  } catch (err) {
    console.error("[profile:GET]", err);
    return NextResponse.json({ error: "Erro ao carregar perfil." }, { status: 500 });
  }
}

/**
 * PATCH /api/profile — atualiza nome, e-mail e/ou senha.
 * Body: { name?, email?, currentPassword?, newPassword? }
 * Reemite o cookie de sessão (nome/e-mail vivem no JWT).
 */
export async function PATCH(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await req.json();

    await connectDB();
    const user = await User.findById(me.id);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (typeof email === "string" && email.trim() && email.toLowerCase().trim() !== user.email) {
      const next = email.toLowerCase().trim();
      if (!EMAIL_RE.test(next)) {
        return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
      }
      const exists = await User.findOne({ email: next, _id: { $ne: user._id } });
      if (exists) {
        return NextResponse.json(
          { error: "Já existe uma conta com este e-mail." },
          { status: 409 }
        );
      }
      user.email = next;
    }

    if (newPassword) {
      if (String(newPassword).length < 6) {
        return NextResponse.json(
          { error: "A nova senha deve ter ao menos 6 caracteres." },
          { status: 400 }
        );
      }
      const ok = await bcrypt.compare(String(currentPassword || ""), user.password);
      if (!ok) {
        return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
      }
      user.password = await bcrypt.hash(String(newPassword), 10);
    }

    await user.save();

    // Nome e e-mail ficam embutidos no token, então reemitimos o cookie.
    const token = signToken({ id: user.id, email: user.email, name: user.name });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[profile:PATCH]", err);
    return NextResponse.json({ error: "Erro ao atualizar perfil." }, { status: 500 });
  }
}
