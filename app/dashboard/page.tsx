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
      handleMoodDataChange([]);
      handleGoalDataChange([]);
      handleRecommendationDataChange([]);
      handleCommunityDataChange([]);
      handleSettingsDataChange({});
    };
  }, []);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem('layout', JSON.stringify(newLayout));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-screen md:flex-row md:justify-around">
        <div className="w-full md:w-1/2 xl:w-1/3 p-4" style={{
          gridArea: `${layout.moodTracker.y + 1} / ${layout.moodTracker.x + 1} / ${layout.moodTracker.y + layout.moodTracker.height + 1} / ${layout.moodTracker.x + layout.moodTracker.width + 1}`,
        }}>
          <MoodTracker moodData={moodData} />
        </div>
        <div className="w-full md:w-1/2 xl:w-1/3 p-4" style={{
          gridArea: `${layout.recommendations.y + 1} / ${layout.recommendations.x + 1} / ${layout.recommendations.y + layout.recommendations.height + 1} / ${layout.recommendations.x + layout.recommendations.width + 1}`,
        }}>
          <Recommendations recommendationData={recommendationData} />
        </div>
        <div className="w-full md:w-1/2 xl:w-1/3 p-4" style={{
          gridArea: `${layout.goals.y + 1} / ${layout.goals.x + 1} / ${layout.goals.y + layout.goals.height + 1} / ${layout.goals.x + layout.goals.width + 1}`,
        }}>
          <Goals goalData={goalData} />
        </div>
        <div className="w-full md:w-1/2 xl:w-1/3 p-4" style={{
          gridArea: `${layout.community.y + 1} / ${layout.community.x + 1} / ${layout.community.y + layout.community.height + 1} / ${layout.community.x + layout.community.width + 1}`,
        }}>
          <Community communityData={communityData} />
        </div>
        <div className="w-full md:w-1/2 xl:w-1/3 p-4" style={{
          gridArea: `${layout.settings.y + 1} / ${layout.settings.x + 1} / ${layout.settings.y + layout.settings.height + 1} / ${layout.settings.x + layout.settings.width + 1}`,
        }}>
          <Settings settingsData={settingsData} />
        </div>
      </div>
      <button onClick={() => handleLayoutChange({
        moodTracker: { x: 0, y: 0, width: 1, height: 1 },
        recommendations: { x: 1, y: 0, width: 1, height: 1 },
        goals: { x: 0, y: 1, width: 1, height: 1 },
        community: { x: 1, y: 1, width: 1, height: 1 },
        settings: { x: 0, y: 2, width: 1, height: 1 },
      })}>
        Reset Layout
      </button>
    </DashboardLayout>
  );
}