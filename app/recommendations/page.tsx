use client;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecommendationsData } from '../types/recommendations';
import RecommendationCard from '../components/RecommendationCard';
import Layout from '../layout';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationsData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedRecommendations = localStorage.getItem('recommendations');
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations));
    } else {
      const defaultRecommendations: RecommendationsData[] = [
        { id: 1, title: 'Mindfulness Meditation', description: 'Reduce stress and anxiety with guided meditation' },
        { id: 2, title: 'Gratitude Journaling', description: 'Practice gratitude and positivity with daily journaling' },
        { id: 3, title: 'Physical Activity', description: 'Improve mood and energy with regular exercise' },
      ];
      setRecommendations(defaultRecommendations);
      localStorage.setItem('recommendations', JSON.stringify(defaultRecommendations));
    }
  }, []);

  const handleRecommendationClick = (id: number) => {
    router.push(`/recommendations/${id}`);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Personalized Recommendations</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              title={recommendation.title}
              description={recommendation.description}
              onClick={() => handleRecommendationClick(recommendation.id)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}