
import { Calendar, Clock, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const News = () => {
  const todaysMatches = [
    {
      time: "15:30",
      homeTeam: "Bayern München",
      awayTeam: "Borussia Dortmund",
      competition: "Bundesliga",
      provider: "Sky",
      importance: "high",
      homeLogo: "⚽",
      awayLogo: "🟡"
    },
    {
      time: "18:30",
      homeTeam: "FC Barcelona",
      awayTeam: "Real Madrid",
      competition: "La Liga",
      provider: "DAZN",
      importance: "high",
      homeLogo: "🔵",
      awayLogo: "⚪"
    },
    {
      time: "20:45",
      homeTeam: "Manchester City",
      awayTeam: "Arsenal",
      competition: "Premier League",
      provider: "Sky",
      importance: "medium",
      homeLogo: "🔵",
      awayLogo: "🔴"
    },
    {
      time: "13:30",
      homeTeam: "Hertha BSC",
      awayTeam: "Hamburger SV",
      competition: "2. Bundesliga",
      provider: "Sky",
      importance: "medium",
      homeLogo: "🔷",
      awayLogo: "⚪"
    },
    {
      time: "21:00",
      homeTeam: "AC Milan",
      awayTeam: "Inter Mailand",
      competition: "Serie A",
      provider: "DAZN",
      importance: "high",
      homeLogo: "🔴",
      awayLogo: "🔵"
    }
  ];

  const upcomingHighlights = [
    {
      date: "Mittwoch, 27.06.",
      homeTeam: "Deutschland",
      awayTeam: "Spanien",
      competition: "Nations League",
      provider: "ZDF",
      time: "20:45",
      isHighlight: true
    },
    {
      date: "Samstag, 30.06.",
      homeTeam: "Bayern München",
      awayTeam: "Real Madrid",
      competition: "Champions League",
      provider: "DAZN",
      time: "21:00",
      isHighlight: true
    },
    {
      date: "Sonntag, 01.07.",
      homeTeam: "Liverpool",
      awayTeam: "Manchester United",
      competition: "Premier League",
      provider: "Sky",
      time: "17:30",
      isHighlight: false
    }
  ];

  const broadcastingNews = [
    {
      title: "Sky sichert sich Bundesliga-Rechte bis 2029",
      summary: "Der Pay-TV-Sender verlängert den Vertrag und wird weiterhin alle Samstagsspiele übertragen.",
      date: "vor 2 Tagen",
      category: "Übertragungsrechte",
      impact: "high"
    },
    {
      title: "DAZN erhöht Preise ab Januar 2025",
      summary: "Der Streaming-Dienst passt seine Abogebühren an und führt neue Pakete ein.",
      date: "vor 1 Woche",
      category: "Preisänderung",
      impact: "medium"
    },
    {
      title: "Amazon Prime steigt bei Champions League ein",
      summary: "Prime Video wird ab nächster Saison ausgewählte Königsklassen-Spiele zeigen.",
      date: "vor 2 Wochen",
      category: "Neue Rechte",
      impact: "high"
    },
    {
      title: "MagentaTV übernimmt 3. Liga komplett",
      summary: "Telekom sichert sich exklusiv alle Spiele der dritthöchsten deutschen Spielklasse.",
      date: "vor 3 Wochen",
      category: "Übertragungsrechte",
      impact: "low"
    }
  ];

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Top-Spiel</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Wichtig</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Hohe Auswirkung</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Mittlere Auswirkung</Badge>;
      default:
        return <Badge variant="secondary">Geringe Auswirkung</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Spielplan & Streaming-News
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bleib auf dem Laufenden: Aktuelle Spiele, wo sie laufen und die neuesten Nachrichten 
            zu Übertragungsrechten und Streaming-Anbietern.
          </p>
        </div>

        <Tabs defaultValue="today" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Heute im TV</TabsTrigger>
            <TabsTrigger value="upcoming">Kommende Highlights</TabsTrigger>
            <TabsTrigger value="news">Streaming-News</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            {/* Live Indicator */}
            <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="animate-pulse">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Live: {todaysMatches.length} Spiele heute</h2>
                      <p className="opacity-90">Verpasse kein wichtiges Spiel - hier siehst du alles auf einen Blick</p>
                    </div>
                  </div>
                  <Badge className="bg-white text-green-600 font-bold px-4 py-2">
                    {new Date().toLocaleDateString('de-DE', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Today's Matches */}
            <div className="grid gap-4">
              {todaysMatches.map((match, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="text-center min-w-[60px]">
                          <div className="text-2xl font-bold text-green-600">{match.time}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {match.competition}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-2xl mb-1">{match.homeLogo}</div>
                            <div className="font-semibold text-sm">{match.homeTeam}</div>
                          </div>
                          
                          <div className="text-gray-400 font-bold text-xl px-4">VS</div>
                          
                          <div className="text-center">
                            <div className="text-2xl mb-1">{match.awayLogo}</div>
                            <div className="font-semibold text-sm">{match.awayTeam}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-800">{match.provider}</Badge>
                          {getImportanceBadge(match.importance)}
                        </div>
                        <Button variant="outline" size="sm">
                          Stream öffnen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid gap-6">
              {upcomingHighlights.map((match, index) => (
                <Card key={index} className={`hover:shadow-lg transition-shadow ${match.isHighlight ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {match.isHighlight && <Star className="h-6 w-6 text-yellow-500 fill-current" />}
                        <div>
                          <CardTitle className="text-xl">
                            {match.homeTeam} vs {match.awayTeam}
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{match.date} um {match.time}</span>
                            <Badge variant="secondary">{match.competition}</Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-blue-100 text-blue-800 mb-2">
                          {match.provider}
                        </Badge>
                        {match.isHighlight && (
                          <div>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Must-Watch
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">
                        {match.isHighlight 
                          ? "Absolutes Top-Spiel - nicht verpassen!" 
                          : "Interessantes Spiel mit Potential für Überraschungen"}
                      </p>
                      <Button variant="outline">
                        Erinnerung setzen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <div className="grid gap-6">
              {broadcastingNews.map((news, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <Badge variant="secondary">{news.category}</Badge>
                          {getImpactBadge(news.impact)}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {news.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{news.summary}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {news.date}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="ml-4">
                        Weiterlesen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Newsletter CTA */}
        <Card className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Verpasse nie wieder ein Spiel!</h2>
            <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
              Erhalte personalisierte Spielerinnerungen und die neuesten Streaming-News direkt auf dein Handy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Deine E-Mail für Updates"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0"
              />
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold">
                Benachrichtigungen aktivieren
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default News;
