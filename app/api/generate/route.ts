import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "İsim ve Email zorunludur!" }, { status: 400 });
    }

    const templatePath = path.join(process.cwd(), "public", "certificate.pdf");
    const fontPath = path.join(process.cwd(), "public", "tr-font.ttf");

    if (!fs.existsSync(templatePath) || !fs.existsSync(fontPath)) {
       throw new Error("Sertifika şablonu veya font dosyası bulunamadı!");
    }

    const templateBytes = fs.readFileSync(templatePath);
    const fontBytes = fs.readFileSync(fontPath);

    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.getPages()[0];
    const fontSize = 36;
    const x = 280;
    const y = 330;

    page.drawText(name, {
      x, y, size: fontSize, font: customFont, color: rgb(0.82, 0.1, 0.1),
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"HSD Etkinlik Ekibi" <no-reply@hsd.com>',
      to: email,
      subject: "Huawei Cloud 101 Katılım Sertifikanız",
      html: `
        <h3>Tebrikler ${name}! 🎉</h3>
        <p>Etkinliğimize katılımın bizi çok mutlu etti.</p>
        <p>Sertifikanı hem bu maile ekledik hem de tarayıcına indirdik.</p>
        <br>
        <p>Başarılarının devamını dileriz,<br>HSD Ekibi</p>
      `,
      attachments: [
        {
          filename: `${name}-sertifika.pdf`,
          content: buffer,
          contentType: 'application/pdf'
        },
      ],
    });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}-sertifika.pdf"`,
      },
    });

  } catch (err: any) {
    console.error("İŞLEM HATASI:", err);
    return NextResponse.json({ error: err.message || "Bir hata oluştu" }, { status: 500 });
  }
}