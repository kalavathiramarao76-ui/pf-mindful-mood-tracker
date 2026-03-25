import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import DashboardLayout from '../layout/dashboard-layout';
import MoodTracker from '../components/mood-tracker';
import Recommendations from '../components/recommendations';
import Goals from '../components/goals';
import Community from '../components/community';
import Settings from '../components/settings';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

interface Component {
  id: string;
  component: JSX.Element;
}

interface Layout {
  [key: string]: { x: number; y: number; width: number; height: number };
}

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
      handleMoodDataChange = () => { };
      handleGoalDataChange = () => { };
      handleRecommendationDataChange = () => { };
      handleCommunityDataChange = () => { };
      handleSettingsDataChange = () => { };
    };
  }, []);

  const components: Component[] = [
    { id: 'moodTracker', component: <MoodTracker /> },
    { id: 'recommendations', component: <Recommendations /> },
    { id: 'goals', component: <Goals /> },
    { id: 'community', component: <Community /> },
    { id: 'settings', component: <Settings /> },
  ];

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const newLayout: Layout = { ...layout };
      const activeComponent = components.find((component) => component.id === active.id);
      const overComponent = components.find((component) => component.id === over.id);

      if (activeComponent && overComponent) {
        const activeRect = activeComponent.component.getBoundingClientRect();
        const overRect = overComponent.component.getBoundingClientRect();

        newLayout[active.id] = {
          x: overRect.left - activeRect.left,
          y: overRect.top - activeRect.top,
          width: activeRect.width,
          height: activeRect.height,
        };

        setLayout(newLayout);
        localStorage.setItem('layout', JSON.stringify(newLayout));
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <SortableContext items={components} strategy={rectSortingStrategy}>
        <DashboardLayout>
          {components.map((component) => (
            <div key={component.id} style={{
              position: 'absolute',
              left: `${layout[component.id].x}px`,
              top: `${layout[component.id].y}px`,
              width: `${layout[component.id].width}px`,
              height: `${layout[component.id].height}px`,
            }}>
              {component.component}
            </div>
          ))}
        </DashboardLayout>
      </SortableContext>
    </DndContext>
  );
}