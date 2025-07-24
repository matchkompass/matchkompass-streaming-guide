import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Datenschutz = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <SEOHead 
      title="Datenschutz | MatchStream"
      description="Datenschutzerklärung von MatchStream. Informationen über die Verarbeitung Ihrer persönlichen Daten."
      canonical="https://matchstream.de/datenschutz"
    />
    <Header />
    <main className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6">Datenschutz</h1>
        <p>Hier folgt die Datenschutzerklärung. Bitte fügen Sie Ihre Datenschutzinformationen ein.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Datenschutz; 