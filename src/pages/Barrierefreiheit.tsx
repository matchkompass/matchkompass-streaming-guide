import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Barrierefreiheit = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <SEOHead 
      title="Barrierefreiheit | MatchStream"
      description="Erklärung zur digitalen Barrierefreiheit von MatchStream. Unser Engagement für einen zugänglichen Service."
      canonical="https://matchstream.de/barrierefreiheit"
    />
    <Header />
    <main className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6">Barrierefreiheit</h1>
        <p>Hier folgt die Erklärung zur Barrierefreiheit. Bitte fügen Sie Ihre Informationen zur digitalen Barrierefreiheit ein.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Barrierefreiheit; 