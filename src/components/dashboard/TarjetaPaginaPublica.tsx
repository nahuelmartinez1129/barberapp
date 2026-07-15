"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { Copy, ExternalLink, Download } from "lucide-react";

type Props = {
  slug: string;
};

export function TarjetaPaginaPublica({ slug }: Props) {
  const [copiado, setCopiado] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  const [enlace, setEnlace] = useState("");

useEffect(() => {
  setEnlace(`${window.location.origin}/reservar/${slug}`);
}, [slug]);

  async function copiar() {
    await navigator.clipboard.writeText(enlace);

    setCopiado(true);

    setTimeout(() => {
      setCopiado(false);
    }, 2000);
  }

  async function descargarQR() {
    if (!qrRef.current) return;

    const dataUrl = await toPng(qrRef.current);

    const link = document.createElement("a");

    link.download = `qr-${slug}.png`;

    link.href = dataUrl;

    link.click();
  }

  return (
    <div className="mb-8 rounded-2xl border border-brand-100 bg-white p-6">

      <h2 className="text-xl font-semibold text-brand-900">
        Página pública de turnos
      </h2>

      <p className="mt-2 text-brand-500">
        Compartí este enlace o imprimí el código QR para que tus clientes
        puedan reservar turnos online.
      </p>

      <div className="mt-6 flex flex-col md:flex-row gap-8">

        <div
          ref={qrRef}
          className="rounded-xl border border-brand-100 bg-white p-4"
        >
          <QRCode
            value={enlace}
            size={180}
          />
        </div>

        <div className="flex-1">

          <div className="rounded-lg border border-brand-100 bg-brand-50 p-4 break-all">
            {enlace}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">

            <button
              onClick={copiar}
              className="btn-primary flex items-center gap-2"
            >
              <Copy size={18} />

              {copiado ? "Enlace copiado" : "Copiar enlace"}
            </button>

            <a
              href={enlace}
              target="_blank"
              className="btn-secondary flex items-center gap-2"
            >
              <ExternalLink size={18} />
              Abrir página
            </a>

            <button
              onClick={descargarQR}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={18} />
              Descargar QR
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}