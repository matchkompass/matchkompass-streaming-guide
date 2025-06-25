
import { Clock, Percent, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Deals = () => {
  const currentDeals = [
    {
      provider: "Sky Deutschland",
      logo: "📺",
      title: "Supersport-Angebot",
      originalPrice: 57.00,
      dealPrice: 29.99,
      savings: 27.01,
      duration: "12 Monate",
      description: "Alle Bundesliga-Spiele, 2. Bundesliga und DFB-Pokal",
      validUntil: "31.12.2024",
      isLimited: true,
      highlights: ["Alle 306 Bundesliga-Spiele", "Konferenz am Samstag", "Sky Go inklusive"],
      conditions: "Für Neukunden, danach 57,00€/Monat"
    },
    {
      provider: "DAZN",
      logo: "🥊",
      title: "Champions League Spezial",
      originalPrice: 44.99,
      dealPrice: 19.99,
      savings: 25.00,
      duration: "3 Monate",
      description: "Alle Champions League Spiele + internationale Top-Ligen",
      validUntil: "15.01.2025",
      isLimited: true,
      highlights: ["Komplette Champions League", "La Liga & Serie A", "Flexibel kündbar"],
      conditions: "Nur für Neukunden, danach regulärer Preis"
    },
    {
      provider: "WOW",
      logo: "🎬",
      title: "Sport + Entertainment",
      originalPrice: 29.98,
      dealPrice: 19.99,
      savings: 9.99,
      duration: "6 Monate",
      description: "Sport-Paket + Entertainment für maximalen Spaß",
      validUntil: "28.02.2025",
      isLimited: false,
      highlights: ["Bundesliga-Topspiele", "Premier League komplett", "Filme & Serien"],
      conditions: "Jederzeit kündbar, keine Vertragsbindung"
    },
    {
      provider: "Amazon Prime Video",
      logo: "📦",
      title: "Prime Gaming Bundle",
      originalPrice: 8.99,
      dealPrice: 4.99,
      savings: 4.00,
      duration: "12 Monate",
      description: "Prime Video + Gaming + Versandvorteile",
      validUntil: "31.03.2025",
      isLimited: false,
      highlights: ["Topspiele der Bundesliga", "Prime Gaming inklusive", "Kostenloser Versand"],
      conditions: "Studenten-Angebot, Nachweis erforderlich"
    }
  ];

  const seasonalDeals = [
    {
      title: "Bundesliga-Saisonstart",
      description: "Spezielle Angebote zum Start der neuen Saison",
      period: "August - September",
      providers: ["Sky", "WOW", "DAZN"],
      avgSavings: 35
    },
    {
      title: "Champions League Knockout",
      description: "Reduzierte Preise für die K.O.-Phase",
      period: "Februar - Mai",
      providers: ["DAZN", "Amazon Prime"],
      avgSavings: 25
    },
    {
      title: "Sommer-Pause Deals",
      description: "Günstige Jahresabos in der spielfreien Zeit",
      period: "Juni - Juli",
      providers: ["Alle Anbieter"],
      avgSavings: 40
    }
  ];

  const calculateTimeLeft = (validUntil: string) => {
    const endDate = new Date(validUntil);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      return `${Math.ceil(diffDays / 30)} Monat${Math.ceil(diffDays / 30) > 1 ? 'e' : ''}`;
    }
    return `${diffDays} Tag${diffDays > 1 ? 'e' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Aktuelle Streaming-Deals
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Verpasse keine Sonderangebote! Hier findest du die besten aktuellen Deals 
            für Fußball-Streaming und sparst bares Geld.
          </p>
        </div>

        {/* Hot Deals Alert */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="animate-pulse">
                    <Star className="h-8 w-8 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">🔥 Heiße Deals dieser Woche</h2>
                    <p className="opacity-90">Bis zu 60% Rabatt auf Premium-Streaming-Pakete</p>
                  </div>
                </div>
                <Badge className="bg-white text-red-600 font-bold px-4 py-2">
                  Limitiert
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Deals */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Aktuelle Sonderangebote</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {currentDeals.map((deal, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{deal.logo}</span>
                      <div>
                        <CardTitle className="text-xl">{deal.provider}</CardTitle>
                        <CardDescription className="text-lg font-semibold text-green-600">
                          {deal.title}
                        </CardDescription>
                      </div>
                    </div>
                    {deal.isLimited && (
                      <Badge className="bg-red-100 text-red-800 animate-pulse">
                        <Clock className="h-3 w-3 mr-1" />
                        Limitiert
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-3xl font-bold text-green-600">
                          {deal.dealPrice.toFixed(2)}€
                        </span>
                        <span className="text-gray-500 ml-2">pro Monat</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg text-gray-500 line-through">
                          {deal.originalPrice.toFixed(2)}€
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <Percent className="h-3 w-3 mr-1" />
                          {Math.round((deal.savings / deal.originalPrice) * 100)}% sparen
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Für {deal.duration} • Ersparnis: {deal.savings.toFixed(2)}€/Monat
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700">{deal.description}</p>

                  {/* Highlights */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Inbegriffen:</h4>
                    <ul className="space-y-1">
                      {deal.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="h-2 w-2 bg-green-500 rounded-full mr-3" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Conditions */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>Bedingungen:</strong> {deal.conditions}
                    </p>
                  </div>

                  {/* Validity */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Gültig bis: {deal.validUntil}
                    </span>
                    <span className="text-orange-600 font-semibold">
                      Noch {calculateTimeLeft(deal.validUntil)} gültig
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                    Jetzt Deal sichern *
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Seasonal Deals */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Saisonale Deal-Kalender</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {seasonalDeals.map((season, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{season.title}</CardTitle>
                  <CardDescription>{season.period}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      bis -{season.avgSavings}%
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{season.description}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Teilnehmende Anbieter:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {season.providers.map((provider, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Nie wieder ein Deal verpassen!</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Abonniere unseren Newsletter und erhalte exklusive Deals und Frühbucher-Rabatte 
                direkt in dein Postfach.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Deine E-Mail-Adresse"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0"
              />
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold">
                Anmelden
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              Kostenlos • Jederzeit abmeldbar • Kein Spam
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            * Affiliate-Links: Wir erhalten eine Provision, wenn Sie über unsere Links ein Abonnement abschließen. 
            Alle Preise und Angebote sind unverbindlich und können sich jederzeit ändern. 
            Bitte prüfen Sie die aktuellen Konditionen beim jeweiligen Anbieter.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Deals;
