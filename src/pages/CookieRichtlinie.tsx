import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CookieRichtlinie = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <main className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6">Cookie-Richtlinie</h1>
        <p>Hier folgt die Cookie-Richtlinie. Bitte fügen Sie Ihre Informationen zur Verwendung von Cookies ein.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default CookieRichtlinie; 