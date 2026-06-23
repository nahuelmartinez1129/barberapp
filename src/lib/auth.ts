import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: {
            membresias: {
              include: { barberia: true },
            },
          },
        });

        if (!usuario) return null;

        const passwordValida = await bcrypt.compare(
          credentials.password,
          usuario.passwordHash
        );
        if (!passwordValida) return null;

        return {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          rolGlobal: usuario.rolGlobal,
          membresias: usuario.membresias.map((m) => ({
            barberiaId: m.barberiaId,
            barberiaSlug: m.barberia.slug,
            barberiaNombre: m.barberia.nombre,
            rol: m.rol,
            miembroId: m.id,
          })),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rolGlobal = (user as any).rolGlobal;
        token.membresias = (user as any).membresias;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).rolGlobal = token.rolGlobal;
        (session.user as any).membresias = token.membresias;
      }
      return session;
    },
  },
};
