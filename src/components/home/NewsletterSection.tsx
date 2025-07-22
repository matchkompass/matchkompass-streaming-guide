import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive"
      });
      return;
    }

    // Simulate subscription
    setIsSubscribed(true);
    toast({
      title: "Erfolgreich angemeldet!",
      description: "Sie erhalten künftig unsere neuesten Updates und Deals."
    });
    setEmail("");
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              {isSubscribed ? (
                <CheckCircle className="h-12 w-12 text-green-300" />
              ) : (
                <Mail className="h-12 w-12 text-white" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              {isSubscribed ? "Vielen Dank!" : "Newsletter abonnieren"}
            </h2>
            
            {isSubscribed ? (
              <p className="text-xl opacity-90">
                Sie sind jetzt für unseren Newsletter angemeldet und verpassen keine Deals mehr!
              </p>
            ) : (
              <>
                <p className="text-xl mb-8 opacity-90">
                  Erhalten Sie die neuesten Deals, Updates und exklusive Angebote direkt in Ihr Postfach.
                </p>
                
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Ihre E-Mail-Adresse"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                  />
                  <Button 
                    type="submit"
                    className="bg-white text-green-600 hover:bg-gray-100 font-semibold whitespace-nowrap"
                  >
                    Anmelden
                  </Button>
                </form>
                
                <p className="text-sm opacity-70 mt-4">
                  Kostenlos und jederzeit kündbar. Keine Spam-Mails.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSection;