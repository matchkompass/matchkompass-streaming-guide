
import { useState } from "react";
import { Filter, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Vergleich = () => {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [competitionFilter, setCompetitionFilter] = useState("all");

  const streamingProviders = [
    {
      id: "sky",
      name: "Sky Deutschland",
      logo: "📺",
      basePrice: 25.00,
      sportsPackage: 32.00,
      totalPrice: 57.00,
      competitions: ["Bundesliga", "2. Bundesliga", "DFB-Pokal", "Premier League"],
      features: {
        "4K": true,
        "Mobil": true,
        "Gleichzeitige Streams": 2,
        "Aufnahme": true,
        "Live-Pause": true
      },
      coverage: {
        "Bundesliga": 100,
        "2. Bundesliga": 100,
        "DFB-Pokal": 100,
        "Champions League": 0
      },
      highlights: ["Alle Bundesliga-Spiele", "Konferenz am Samstag", "Original Kommentar"],
      dealInfo: "Jetzt 12 Monate für 29,99€/Monat",
      rating: 4.2,
      pros: ["Komplette Bundesliga", "Exzellente Übertragungsqualität", "Umfangreiches Sportangebot"],
      cons: ["Teuerster Anbieter", "Lange Vertragslaufzeit", "Keine Champions League"]
    },
    {
      id: "dazn",
      name: "DAZN",
      logo: "🥊",
      basePrice: 44.99,
      sportsPackage: 0,
      totalPrice: 44.99,
      competitions: ["Champions League", "Europa League", "La Liga", "Serie A"],
      features: {
        "4K": false,
        "Mobil": true,
        "Gleichzeitige Streams": 2,
        "Aufnahme": false,
        "Live-Pause": true
      },
      coverage: {
        "Bundesliga": 0,
        "Champions League": 100,
        "La Liga": 100,
        "Serie A": 100
      },
      highlights: ["Alle Champions League Spiele", "Internationale Top-Ligen", "Vielfältiger Sport-Mix"],
      dealInfo: "Flexible monatliche Kündigung",
      rating: 3.8,
      pros: ["Champions League komplett", "Internationale Ligen", "Flexible Kündigung"],
      cons: ["Keine deutsche Bundesliga", "Kein 4K", "Häufige Preiserhöhungen"]
    },
    {
      id: "wow",
      name: "WOW (ehemals Sky Ticket)",
      logo: "🎬",
      basePrice: 9.99,
      sportsPackage: 19.99,
      totalPrice: 29.98,
      competitions: ["Bundesliga", "DFB-Pokal", "Premier League", "Formula 1"],
      features: {
        "4K": false,
        "Mobil": true,
        "Gleichzeitige Streams": 1,
        "Aufnahme": false,
        "Live-Pause": false
      },
      coverage: {
        "Bundesliga": 85,
        "DFB-Pokal": 100,
        "Premier League": 100,
        "Formula 1": 100
      },
      highlights: ["Günstige Sky-Alternative", "Flexibel buchbar", "Keine Vertragsbindung"],
      dealInfo: "Sport-Paket für 19,99€/Monat",
      rating: 3.9,
      pros: ["Günstigster Zugang zu Sky-Inhalten", "Keine Vertragsbindung", "Einfache Kündigung"],
      cons: ["Kein 4K", "Nur ein Stream gleichzeitig", "Nicht alle Bundesliga-Spiele"]
    },
    {
      id: "amazon",
      name: "Amazon Prime Video",
      logo: "📦",
      basePrice: 8.99,
      sportsPackage: 0,
      totalPrice: 8.99,
      competitions: ["Einzelspiele Bundesliga", "Champions League (ausgewählte)", "Tennis"],
      features: {
        "4K": true,
        "Mobil": true,
        "Gleichzeitige Streams": 3,
        "Aufnahme": false,
        "Live-Pause": true
      },
      coverage: {
        "Bundesliga": 10,
        "Champions League": 25,
        "Tennis": 60,
        "Prime Originals": 100
      },
      highlights: ["Top-Einzelspiele", "Prime-Vorteile inklusive", "Große Streaming-Bibliothek"],
      dealInfo: "Inklusive Prime-Mitgliedschaft",
      rating: 4.1,
      pros: ["Sehr günstig", "Prime-Mitgliedschaft inklusive", "Hochwertige Eigenproduktionen"],
      cons: ["Wenige Live-Spiele", "Begrenzte Sportauswahl", "Unregelmäßige Übertragungen"]
    },
    {
      id: "magenta",
      name: "MagentaTV",
      logo: "📱",
      basePrice: 5.00,
      sportsPackage: 12.95,
      totalPrice: 17.95,
      competitions: ["3. Liga", "Regionalliga", "Frauenfußball", "Basketball"],
      features: {
        "4K": true,
        "Mobil": true,
        "Gleichzeitige Streams": 4,
        "Aufnahme": true,
        "Live-Pause": true
      },
      coverage: {
        "3. Liga": 100,
        "Regionalliga": 100,
        "Frauenfußball": 100,
        "Basketball": 80
      },
      highlights: ["Komplette 3. Liga", "Deutscher Nachwuchsfußball", "Günstige Telekom-Option"],
      dealInfo: "Für Telekom-Kunden vergünstigt",
      rating: 3.6,
      pros: ["Sehr günstig für Telekom-Kunden", "Untere Ligen komplett", "Gute technische Qualität"],
      cons: ["Keine Top-Ligen", "Hauptsächlich für Telekom-Kunden", "Begrenzte Reichweite"]
    }
  ];

  const competitions = [
    "Alle Wettbewerbe",
    "Bundesliga",
    "2. Bundesliga", 
    "Champions League",
    "DFB-Pokal",
    "La Liga",
    "Premier League"
  ];

  const filteredProviders = streamingProviders.filter(provider => {
    const matchesPrice = priceFilter === "all" || 
      (priceFilter === "budget" && provider.totalPrice <= 30) ||
      (priceFilter === "mid" && provider.totalPrice > 30 && provider.totalPrice <= 50) ||
      (priceFilter === "premium" && provider.totalPrice > 50);

    const matchesCompetition = competitionFilter === "all" || 
      provider.competitions.some(comp => 
        comp.toLowerCase().includes(competitionFilter.toLowerCase())
      );

    return matchesPrice && matchesCompetition;
  });

  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Streaming-Anbieter Vergleich
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vergleiche alle wichtigen Streaming-Dienste für Fußball und finde die beste Option für deine Bedürfnisse
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preisbereich
                </label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Preise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Preise</SelectItem>
                    <SelectItem value="budget">Budget (bis 30€)</SelectItem>
                    <SelectItem value="mid">Mittel (30-50€)</SelectItem>
                    <SelectItem value="premium">Premium (über 50€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wettbewerb
                </label>
                <Select value={competitionFilter} onValueChange={setCompetitionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Wettbewerbe" />
                  </SelectTrigger>
                  <SelectContent>
                    {competitions.map((comp) => (
                      <SelectItem key={comp} value={comp === "Alle Wettbewerbe" ? "all" : comp}>
                        {comp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Weitere Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <div className="grid gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{provider.logo}</div>
                    <div>
                      <CardTitle className="text-2xl">{provider.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(provider.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({provider.rating})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {provider.totalPrice.toFixed(2)}€
                    </div>
                    <div className="text-sm text-gray-500">pro Monat</div>
                    {provider.dealInfo && (
                      <Badge className="mt-2 bg-orange-100 text-orange-800">
                        {provider.dealInfo}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Wettbewerbe */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Wettbewerbe</h4>
                    <div className="space-y-2">
                      {provider.competitions.map((comp, idx) => (
                        <Badge key={idx} variant="secondary" className="mr-1 mb-1">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                    <ul className="space-y-1 text-sm">
                      {Object.entries(provider.features).map(([feature, available]) => (
                        <li key={feature} className="flex items-center">
                          {available ? (
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <div className="h-4 w-4 mr-2" />
                          )}
                          <span className={available ? 'text-gray-900' : 'text-gray-400'}>
                            {feature}: {typeof available === 'boolean' ? (available ? 'Ja' : 'Nein') : available}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Vorteile */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Vorteile</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      {provider.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Nachteile */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Nachteile</h4>
                    <ul className="space-y-1 text-sm text-red-600">
                      {provider.cons.map((con, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="h-3 w-3 mt-1 mr-2 rounded-full bg-red-500 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    Zum Anbieter *
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleProviderToggle(provider.id)}
                    className={selectedProviders.includes(provider.id) ? 'bg-blue-50 border-blue-300' : ''}
                  >
                    {selectedProviders.includes(provider.id) ? 'Ausgewählt' : 'Zum Vergleich hinzufügen'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedProviders.length > 1 && (
          <div className="mt-8 text-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {selectedProviders.length} Anbieter detailliert vergleichen
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            * Affiliate-Links: Wir erhalten eine Provision, wenn Sie über unsere Links ein Abonnement abschließen. 
            Dies beeinflusst nicht unsere Bewertungen und Vergleiche. Alle Preise sind unverbindlich und können sich ändern.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Vergleich;
