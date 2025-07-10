import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs?: FAQ[];
}

const defaultFAQs: FAQ[] = [
  {
    question: "Wie genau berechnet MatchKompass die Abdeckung?",
    answer: "MatchKompass analysiert alle Wettbewerbe, in denen deine ausgewählten Vereine spielen, und berechnet basierend auf den Übertragungsrechten der verschiedenen Streaming-Anbieter die exakte Anzahl der Spiele, die du mit jeder Kombination sehen kannst. Dabei berücksichtigen wir sowohl nationale als auch internationale Wettbewerbe."
  },
  {
    question: "Sind die Preise immer aktuell?",
    answer: "Wir aktualisieren unsere Preisdatenbank täglich und berücksichtigen auch Sonderangebote und zeitlich begrenzte Aktionen. Da sich Preise bei Streaming-Anbietern jedoch schnell ändern können, empfehlen wir dir, die finalen Konditionen direkt beim Anbieter zu prüfen."
  },
  {
    question: "Warum sollte ich MatchKompass nutzen statt direkt bei den Anbietern zu schauen?",
    answer: "MatchKompass spart dir Zeit und Geld, indem wir alle Anbieter gleichzeitig vergleichen und mathematisch präzise berechnen, welche Kombination für deine spezifischen Vereine am günstigsten ist. Ohne uns müsstest du manuell durch alle Anbieter klicken und selbst rechnen."
  },
  {
    question: "Welche Streaming-Anbieter werden berücksichtigt?",
    answer: "Wir berücksichtigen alle großen Streaming-Anbieter in Deutschland: Sky, DAZN, Amazon Prime Video, WOW (früher Sky Ticket), MagentaTV und weitere. Unsere Datenbank wird kontinuierlich erweitert, wenn neue Anbieter den deutschen Markt betreten."
  },
  {
    question: "Ist MatchKompass kostenlos?",
    answer: "Ja, die Nutzung von MatchKompass ist komplett kostenlos. Wir finanzieren uns über Affiliate-Partnerschaften mit den Streaming-Anbietern. Das bedeutet: Du zahlst nichts extra, aber wir erhalten eine kleine Provision, wenn du über unsere Links ein Abo abschließt."
  },
  {
    question: "Wie oft sollte ich meine Empfehlungen aktualisieren?",
    answer: "Wir empfehlen, deine Empfehlungen zu Saisonbeginn und bei größeren Preisänderungen der Anbieter zu aktualisieren. Wenn sich die Vereinszusammensetzung in den Wettbewerben ändert (z.B. durch Qualifikation für internationale Turniere), solltest du auch eine neue Berechnung durchführen."
  }
];

const FAQSection: React.FC<FAQSectionProps> = ({ faqs = defaultFAQs }) => {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Häufig gestellte Fragen
          </h2>
          <p className="text-gray-600">
            Alles was du über MatchKompass wissen musst
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white rounded-lg border shadow-sm"
            >
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <span className="font-semibold text-gray-900">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Weitere Fragen? Wir helfen gerne weiter!
          </p>
          <a 
            href="mailto:support@matchkompass.de" 
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            support@matchkompass.de
          </a>
        </div>
      </div>
      
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
    </section>
  );
};

export default FAQSection;