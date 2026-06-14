import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    try {
      await connectDB();
    } catch (err) {
      console.error("[login connectDB]", err);
      return NextResponse.json(
        { error: "Erro ao conectar ao banco de dados. Verifique MONGODB_URI e credenciais." },
        { status: 500 }
      );
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    console.error("[login]", err);
    const msg = err?.errorResponse?.errmsg || err?.message || String(err || "");
    if (String(msg).toLowerCase().includes("auth") || String(msg).toLowerCase().includes("authentication")) {
      return NextResponse.json(
        { error: "Erro ao conectar ao banco de dados. Verifique MONGODB_URI e credenciais." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Erro ao entrar." }, { status: 500 });
  }
}
