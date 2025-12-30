
import { Users, Shield, Target, BookOpen, Mail, Linkedin, Twitter } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const authors = [
    {
        name: "Alexander Schmidt",
        role: "Co-Founder & Chef-Redakteur",
        bio: "Als leidenschaftlicher Fußballfan und Technologie-Experte gründete Alexander MatchStream, um Fans dabei zu helfen, den Überblick im komplexen Streaming-Markt zu behalten. Seine Vision ist es, maximale Transparenz in die Sport-Übertragungen zu bringen.",
        expertise: ["Streaming-Märkte", "Technologie", "Produktstrategie"],
        image: "https://ui-avatars.com/api/?name=Alexander+Schmidt&background=E8F5E9&color=2E7D32"
    },
    {
        name: "David Aschauer",
        role: "Co-Founder & Fußball-Analyst",
        bio: "David analysiert seit über 10 Jahren die Rechtevergabe im europäischen Spitzenfußball. Als Redakteur und Analyst sorgt er dafür, dass unsere Daten zur Liga-Abdeckung immer auf dem neuesten Stand sind und die Tipps für Fans wirklich wertvoll bleiben.",
        expertise: ["TV-Rechte", "Fußball-Analyse", "Redaktion"],
        image: "https://ui-avatars.com/api/?name=David+Aschauer&background=E8F5E9&color=2E7D32"
    }
];

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <SEOHead
                title="Über uns | MatchStream - Transparenz & Expertise im Fußball-Streaming"
                description="Lernen Sie das Team hinter MatchStream kennen. Wir sorgen für Transparenz im Dschungel der Fußball-Streaming-Anbieter."
            />
            <Header />

            <main>
                {/* Hero Section */}
                <section className="bg-green-600 py-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Unsere Mission: Transparenz für Fußballfans
                        </h1>
                        <p className="text-xl text-green-50 max-w-2xl mx-auto">
                            MatchStream wurde aus der Frustration heraus geboren, dass es immer schwieriger wird, herauszufinden,
                            wo man welches Spiel sehen kann. Wir bringen Klarheit in den Streaming-Dschungel.
                        </p>
                    </div>
                </section>

                {/* Authors Section */}
                <section className="py-16 px-4 max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                            <Users className="text-green-600" />
                            Das Team hinter MatchStream
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {authors.map((author) => (
                            <Card key={author.name} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-1/3 bg-green-50 p-8 flex items-center justify-center">
                                            <img
                                                src={author.image}
                                                alt={author.name}
                                                className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white"
                                            />
                                        </div>
                                        <div className="md:w-2/3 p-8">
                                            <div className="mb-4">
                                                <h3 className="text-2xl font-bold text-gray-900">{author.name}</h3>
                                                <p className="text-green-600 font-semibold">{author.role}</p>
                                            </div>
                                            <p className="text-gray-600 mb-6 leading-relaxed">
                                                {author.bio}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {author.expertise.map(skill => (
                                                    <span key={skill} className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-4">
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-green-600">
                                                    <Linkedin className="w-5 h-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-green-600">
                                                    <Twitter className="w-5 h-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-green-600">
                                                    <Mail className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Transparency Section */}
                <section className="bg-white py-16 px-4 border-y border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ehrlichkeit & Transparenz</h2>
                            <p className="text-gray-600">Uns ist wichtig, dass Sie wissen, wie wir arbeiten.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                                        <Shield className="text-green-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">Unabhängige Analyse</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Unsere Vergleiche basieren auf harten Daten. Wir prüfen jeden Anbieter persönlich
                                            und aktualisieren unsere Liga-Abdeckung wöchentlich, um maximale Genauigkeit zu garantieren.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                                        <BookOpen className="text-blue-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">Redaktionelle Standards</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Wir halten uns an strenge journalistische Grundsätze. Unsere Empfehlungen sind nicht käuflich.
                                            Wir zeigen Ihnen immer die objektiv besten Optionen für Ihre Bedürfnisse.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center shrink-0">
                                        <Target className="text-yellow-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">Finanzierung</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            MatchStream finanziert sich teilweise über Affiliate-Links. Das bedeutet, wir erhalten eine kleine
                                            Provision, wenn Sie über unsere Seite ein Abo abschließen. Für Sie entstehen dabei **keine** Mehrkosten.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                    <h4 className="font-bold text-green-800 mb-2">Haben Sie Fragen?</h4>
                                    <p className="text-green-700 text-sm mb-4">
                                        Wir sind jederzeit für Feedback oder Fragen offen. Schreiben Sie uns einfach eine E-Mail.
                                    </p>
                                    <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                                        Kontakt aufnehmen
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-20 px-4 text-center">
                    <div className="max-w-2xl mx-auto bg-gray-900 text-white rounded-3xl p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">Bereit für den Anstoß?</h2>
                            <p className="text-gray-400 mb-8">
                                Nutzen Sie unsere Tools, um heute noch den perfekten Streaming-Anbieter zu finden.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button variant="secondary" size="lg" asChild>
                                    <a href="/wizard">Wizard starten</a>
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700" size="lg" asChild>
                                    <a href="/vergleich">Vergleich ansehen</a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
