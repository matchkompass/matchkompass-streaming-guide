import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const CookieDeclaration = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <SEOHead 
      title="Cookie-Erklärung | MatchStream"
      description="Cookie-Erklärung von MatchStream. Detaillierte Informationen über die auf unserer Website verwendeten Cookies."
      canonical="https://matchstream.de/cookies"
    />
    <Header />
    <main className="flex-1 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">Cookie-Erklärung</h1>
          <div className="prose max-w-none">
            <p className="mb-6">
              Diese Website verwendet Cookies, um Ihnen das bestmögliche Erlebnis zu bieten. 
              Nachfolgend finden Sie eine detaillierte Übersicht über alle auf dieser Website verwendeten Cookies.
            </p>
            
            {/* Cookiebot Cookie Declaration */}
            <script 
              id="CookieDeclaration" 
              src="https://consent.cookiebot.com/828eeb3b-e804-4969-85ae-2c7692721f0e/cd.js" 
              type="text/javascript" 
              async
            ></script>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default CookieDeclaration;