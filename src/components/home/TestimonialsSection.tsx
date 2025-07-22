import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Max M.",
      location: "München",
      rating: 5,
      text: "Endlich eine Plattform, die mir zeigt, welche Streaming-Dienste ich wirklich brauche! Spare jetzt 40€ im Monat.",
      avatar: "👨‍💼"
    },
    {
      name: "Anna K.",
      location: "Berlin",
      rating: 5,
      text: "Super einfach zu bedienen. Der Wizard hat mir in 2 Minuten die perfekte Lösung für meine Bundesliga-Spiele gezeigt.",
      avatar: "👩‍🎓"
    },
    {
      name: "Carlos R.",
      location: "Hamburg",
      rating: 5,
      text: "Als Barcelona-Fan in Deutschland war es schwer, alle Spiele zu finden. MatchStream macht es kinderleicht!",
      avatar: "👨‍🔬"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Was unsere Nutzer sagen
          </h2>
          <p className="text-xl text-gray-600">
            Über 10.000 Fußball-Fans vertrauen bereits auf MatchStream
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{testimonial.avatar}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;