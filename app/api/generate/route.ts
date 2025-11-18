import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name || "İsimsiz";

    // Dosya yolları
    const templatePath = path.join(process.cwd(), "public", "certificate.pdf");
    // 2. Font dosyasının yolu (public klasörüne attığın dosya ismiyle aynı olsun)
    const fontPath = path.join(process.cwd(), "public", "tr-font.ttf"); 

    if (!fs.existsSync(templatePath) || !fs.existsSync(fontPath)) {
      throw new Error("Dosyalar bulunamadı (certificate.pdf veya tr-font.ttf eksik)");
    }

    const templateBytes = fs.readFileSync(templatePath);
    const fontBytes = fs.readFileSync(fontPath);

    const pdfDoc = await PDFDocument.load(templateBytes);

    // 3. Fontkit'i kaydet ve fontu göm
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.getPages()[0];
    const fontSize = 36;

    // 4. Yeni Koordinatlar
    const x = 280;
    const y = 330;

    page.drawText(name, {
      x,
      y,
      size: fontSize,
      font: customFont, // Standart font yerine bunu kullanıyoruz
      color: rgb(0.82, 0.1, 0.1),
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}-sertifika.pdf"`,
      },
    });

  } catch (err: any) {
    console.error("PDF ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}