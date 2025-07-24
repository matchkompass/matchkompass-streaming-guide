import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const AGB = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <SEOHead 
      title="AGB - Allgemeine Geschäftsbedingungen | MatchStream"
      description="Allgemeine Geschäftsbedingungen von MatchStream. Alle wichtigen rechtlichen Informationen für die Nutzung unseres Services."
      canonical="https://matchstream.de/agb"
    />
    <Header />
    <main className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p>Hier folgen die AGB. Bitte fügen Sie Ihre Geschäftsbedingungen ein.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default AGB; 