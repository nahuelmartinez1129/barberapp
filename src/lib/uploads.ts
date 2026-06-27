/**
 * Capa de subida de archivos.
 *
 * Hoy: guarda el archivo en disco, en public/uploads/, y devuelve una URL
 * relativa servida directamente por Next.js (ej: "/uploads/abc123.png").
 *
 * Mañana (Cloudinary): esta es la UNICA funcion que hay que reemplazar.
 * La firma (recibe un File, devuelve un string con la URL publica) se
 * mantiene igual, asi que ningun componente ni server action que llame a
 * `subirImagen` necesita cambiar cuando migremos.
 *
 * Migracion futura (referencia, no implementada todavia):
 *
 *   import { v2 as cloudinary } from "cloudinary";
 *   cloudinary.config({
 *     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 *     api_key: process.env.CLOUDINARY_API_KEY,
 *     api_secret: process.env.CLOUDINARY_API_SECRET,
 *   });
 *
 *   export async function subirImagen(file: File, carpeta: string) {
 *     const buffer = Buffer.from(await file.arrayBuffer());
 *     const resultado = await cloudinary.uploader.upload(
 *       `data:${file.type};base64,${buffer.toString("base64")}`,
 *       { folder: carpeta }
 *     );
 *     return resultado.secure_url;
 *   }
 *
 * Por eso ya se le pasa `carpeta` como parametro, aunque la version local
 * no lo necesite con tanta fuerza (Cloudinary si lo usa para organizar).
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";

const EXTENSIONES_PERMITIDAS = ["jpg", "jpeg", "png", "webp"];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

export async function subirImagen(file: File, carpeta: string): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
    throw new Error("Formato de imagen no soportado. Usá JPG, PNG o WEBP.");
  }

  if (file.size > TAMANO_MAXIMO_BYTES) {
    throw new Error("La imagen es demasiado grande. Máximo 5MB.");
  }

  const nombreArchivo = `${carpeta}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;

  const directorioDestino = path.join(process.cwd(), "public", "uploads");
  await mkdir(directorioDestino, { recursive: true });

  const rutaCompleta = path.join(directorioDestino, nombreArchivo);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(rutaCompleta, buffer);

  // URL publica servida directamente por Next.js desde /public
  return `/uploads/${nombreArchivo}`;
}
