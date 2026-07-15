import { DefaultSession } from "next-auth";

export type MembresiaSesion = {
  barberiaId: string;
  barberiaSlug: string;
  barberiaNombre: string;
  rol: "DUENO" | "BARBERO";
  miembroId: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rolGlobal: "SUPER_ADMIN" | "USUARIO";
      membresias: MembresiaSesion[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    rolGlobal: "SUPER_ADMIN" | "USUARIO";
    membresias: MembresiaSesion[];
  }
}
