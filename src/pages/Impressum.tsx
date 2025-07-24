import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Impressum = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <SEOHead 
      title="Impressum | MatchStream"
      description="Impressum und rechtliche Informationen von MatchStream - dem führenden Streaming-Guide für Fußball."
      canonical="https://matchstream.de/impressum"
    />
    <Header />
    <main className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6">Impressum</h1>
        <div className="space-y-4 text-base text-gray-800">
          <p><strong>Angaben gemäß § 5 TMG:</strong></p>
          <p>
            Alexander Schmidt, Daniel Jagob, David Aschauer GbR<br />
            Rothenburgstr. 4a<br />
            12163 Berlin<br />
            Deutschland
          </p>
          <p><strong>Vertreten durch:</strong><br />
            Alexander Schmidt, Daniel Jagob, David Aschauer
          </p>
          <p><strong>Kontakt:</strong><br />
            Telefon: <a href="tel:+491735112095" className="text-blue-600 hover:underline">+49 173 5112095</a><br />
            E-Mail: <a href="mailto:matchkompass@gmail.com" className="text-blue-600 hover:underline">matchkompass@gmail.com</a>
          </p>
          <p>
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:<br />
            Alexander Schmidt, Daniel Jagob, David Aschauer GbR<br />
            Rothenburgstr. 4a, 12163 Berlin
          </p>
          <p>
            <strong>Haftungsausschluss:</strong><br />
            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Impressum;
