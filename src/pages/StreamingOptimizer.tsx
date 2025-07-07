import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StreamingOptimizer from '@/components/StreamingOptimizer';

const StreamingOptimizerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <StreamingOptimizer />
      </main>
      <Footer />
    </div>
  );
};

export default StreamingOptimizerPage;