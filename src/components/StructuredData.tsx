import React from 'react';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'faq' | 'breadcrumb' | 'product';
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getStructuredData = () => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "MatchStream",
          "url": "https://matchstream.de",
          "description": "Finde die perfekte Streaming-Kombination für deine Lieblingsvereine",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://matchstream.de/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        };
      
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "MatchStream",
          "url": "https://matchstream.de",
          "logo": "https://matchstream.de/favicon.ico",
          "sameAs": [
            "https://www.instagram.com/matchstream"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+49-173-5112095",
            "contactType": "customer service",
            "email": "matchkompass@gmail.com"
          }
        };
      
      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.questions.map((q: any) => ({
            "@type": "Question",
            "name": q.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": q.answer
            }
          }))
        };
      
      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };
      
      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "brand": {
            "@type": "Brand",
            "name": data.brand
          },
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock"
          }
        };
      
      default:
        return data;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
};

export default StructuredData; 