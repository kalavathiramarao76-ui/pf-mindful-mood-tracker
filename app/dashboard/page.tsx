use client;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import DashboardLayout from '../layout/dashboard-layout';
import MoodTracker from '../components/mood-tracker';
import Recommendations from '../components/recommendations';
import Goals from '../components/goals';
import Community from '../components/community';
import Settings from '../components/settings';

export default function DashboardPage() {
  const [moodData, setMoodData] = useState(() => {
    const storedMoodData = localStorage.getItem('moodData');
    return storedMoodData ? JSON.parse(storedMoodData) : [];
  });
  const [goalData, setGoalData] = useState(() => {
    const storedGoalData = localStorage.getItem('goalData');
    return storedGoalData ? JSON.parse(storedGoalData) : [];
  });
  const [recommendationData, setRecommendationData] = useState(() => {
    const storedRecommendationData = localStorage.getItem('recommendationData');
    return storedRecommendationData ? JSON.parse(storedRecommendationData) : [];
  });
  const [communityData, setCommunityData] = useState(() => {
    const storedCommunityData = localStorage.getItem('communityData');
    return storedCommunityData ? JSON.parse(storedCommunityData) : [];
  });
  const [settingsData, setSettingsData] = useState(() => {
    const storedSettingsData = localStorage.getItem('settingsData');
    return storedSettingsData ? JSON.parse(storedSettingsData) : {};
  });
  const [layout, setLayout] = useState(() => {
    const storedLayout = localStorage.getItem('layout');
    return storedLayout ? JSON.parse(storedLayout) : {
      moodTracker: { x: 0, y: 0, width: 1, height: 1 },
      recommendations: { x: 1, y: 0, width: 1, height: 1 },
      goals: { x: 0, y: 1, width: 1, height: 1 },
      community: { x: 1, y: 1, width: 1, height: 1 },
      settings: { x: 0, y: 2, width: 1, height: 1 },
    };
  });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleMoodDataChange = (newMoodData) => {
      setMoodData(newMoodData);
      localStorage.setItem('moodData', JSON.stringify(newMoodData));
    };
    const handleGoalDataChange = (newGoalData) => {
      setGoalData(newGoalData);
      localStorage.setItem('goalData', JSON.stringify(newGoalData));
    };
    const handleRecommendationDataChange = (newRecommendationData) => {
      setRecommendationData(newRecommendationData);
      localStorage.setItem('recommendationData', JSON.stringify(newRecommendationData));
    };
    const handleCommunityDataChange = (newCommunityData) => {
      setCommunityData(newCommunityData);
      localStorage.setItem('communityData', JSON.stringify(newCommunityData));
    };
    const handleSettingsDataChange = (newSettingsData) => {
      setSettingsData(newSettingsData);
      localStorage.setItem('settingsData', JSON.stringify(newSettingsData));
    };

    return () => {
      handleMoodDataChange = null;
      handleGoalDataChange = null;
      handleRecommendationDataChange = null;
      handleCommunityDataChange = null;
      handleSettingsDataChange = null;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <div className="bg-white rounded shadow-md p-4">
          <MoodTracker moodData={moodData} onMoodDataChange={(newMoodData) => setMoodData(newMoodData)} />
        </div>
        <div className="bg-white rounded shadow-md p-4">
          <Recommendations recommendationData={recommendationData} onRecommendationDataChange={(newRecommendationData) => setRecommendationData(newRecommendationData)} />
        </div>
        <div className="bg-white rounded shadow-md p-4">
          <Goals goalData={goalData} onGoalDataChange={(newGoalData) => setGoalData(newGoalData)} />
        </div>
        <div className="bg-white rounded shadow-md p-4 col-span-2">
          <Community communityData={communityData} onCommunityDataChange={(newCommunityData) => setCommunityData(newCommunityData)} />
        </div>
        <div className="bg-white rounded shadow-md p-4">
          <Settings settingsData={settingsData} onSettingsDataChange={(newSettingsData) => setSettingsData(newSettingsData)} />
        </div>
      </div>
    </DashboardLayout>
  );
}