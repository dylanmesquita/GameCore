import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter ao menos 6 caracteres." },
        { status: 400 }
      );
    }

    try {
      await connectDB();
    } catch (err) {
      console.error("[signup connectDB]", err);
      return NextResponse.json(
        { error: "Erro ao conectar ao banco de dados. Verifique MONGODB_URI e credenciais." },
        { status: 500 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma conta com este e-mail." },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hash,
    });

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    await setAuthCookie(token);

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[signup]", err);
    const msg =
      err?.errorResponse?.errmsg || err?.message || String(err || "");
    if (String(msg).toLowerCase().includes("auth") || String(msg).toLowerCase().includes("authentication")) {
      return NextResponse.json(
        { error: "Erro ao conectar ao banco de dados. Verifique MONGODB_URI e credenciais." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Erro ao criar a conta." }, { status: 500 });
  }
}
