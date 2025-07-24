import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Widerrufsrecht = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <SEOHead 
      title="Widerrufsrecht | MatchStream"
      description="Informationen zum Widerrufsrecht bei MatchStream. Ihre Rechte als Verbraucher im Überblick."
      canonical="https://matchstream.de/widerrufsrecht"
    />
    <Header />
    <main className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6">Widerrufsrecht</h1>
        <p>Hier folgt das Widerrufsrecht. Bitte fügen Sie Ihre Widerrufsbelehrung ein.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Widerrufsrecht; 