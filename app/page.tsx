"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleGenerate = async () => {
    if (!name.trim() || !email.trim()) {
      setStatus({ type: "error", msg: "Lütfen isim ve email alanlarını doldur." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
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
      
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      setStatus({ 
        type: "success", 
        msg: "Sertifika cihazına indirildi ve mail adresine gönderildi!" 
      });
      
      setName("");
      setEmail("");

    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        <div className="bg-red-600 p-6 text-center">
          <div className="mb-4 flex justify-center">

             <Image src="/logo.png" alt="HSD Logo" width={250} height={250} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sertifika Al</h1>
        </div>

        <div className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
            />
          </div>

          {status && (
            <div className={`p-3 rounded-lg text-sm flex items-center ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
               {status.msg}
            </div>
          )}

          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all shadow-md flex justify-center items-center
              ${loading ? 'bg-red-400 cursor-wait' : 'bg-red-600 hover:bg-red-700 hover:shadow-lg active:scale-[0.98]'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                İşleniyor...
              </>
            ) : (
              "Sertifikayı Oluştur ve Gönder"
            )}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            *Sertifikanız otomatik olarak inecek ve mail adresinize gönderilecektir.
          </p>
        </div>
      </div>
    </div>
  );
}