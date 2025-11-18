"use client";

import { useState } from "react";
import Image from "next/image"; // next/image bileşenini import et

export default function Home() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!name.trim()) {
      setError("Lütfen geçerli bir isim gir.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Bir hata oluştu");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}-sertifika.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("İndirme hatası:", err);
      setError(err.message || "Sertifika oluşturulurken bir sorun çıktı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Üst Kısım - Başlık ve Logo */}
        <div className="bg-red-600 p-6 text-center">
          {/* Logo Kısmı */}
          <div className="mb-4 flex justify-center">
            {/* next/image bileşenini kullanıyoruz */}
            <Image
              src="/logo.png" // public klasöründeki logonun yolu
              alt="Huawei Student Developers Logo"
              width={150} // logonun genişliği (piksel)
              height={150} // logonun yüksekliği (piksel)
              className="object-contain" // Oranları koruyarak sığdır
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Sertifika Oluştur</h1>
          <p className="text-red-100 text-sm mt-2">
            Etkinlik katılım belgenizi hemen indirin.
          </p>
        </div>

        {/* Form Kısmı */}
        <div className="p-8">
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ad Soyad
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null); // Yazmaya başlayınca hatayı sil
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Hata Mesajı Alanı */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-lg font-semibold text-white shadow-md transition-all duration-200 flex items-center justify-center
              ${
                loading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 hover:shadow-lg active:scale-[0.98]"
              }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Hazırlanıyor...
              </>
            ) : (
              "Sertifikayı İndir"
            )}
          </button>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Huawei Student Developers
          </p>
        </div>
      </div>
    </div>
  );
}