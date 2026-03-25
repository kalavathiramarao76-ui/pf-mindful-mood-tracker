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

interface DashboardConfig {
  layout: Layout;
  components: {
    [key: string]: {
      id: string;
      component: JSX.Element;
      removable: boolean;
      resizable: boolean;
    };
  };
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
  const [dashboardConfig, setDashboardConfig] = useState(() => {
    const storedDashboardConfig = localStorage.getItem('dashboardConfig');
    return storedDashboardConfig ? JSON.parse(storedDashboardConfig) : {
      layout: {
        moodTracker: { x: 0, y: 0, width: 1, height: 1 },
        recommendations: { x: 1, y: 0, width: 1, height: 1 },
        goals: { x: 0, y: 1, width: 1, height: 1 },
        community: { x: 1, y: 1, width: 1, height: 1 },
        settings: { x: 0, y: 2, width: 1, height: 1 },
      },
      components: {
        moodTracker: {
          id: 'moodTracker',
          component: <MoodTracker />,
          removable: false,
          resizable: true,
        },
        recommendations: {
          id: 'recommendations',
          component: <Recommendations />,
          removable: false,
          resizable: true,
        },
        goals: {
          id: 'goals',
          component: <Goals />,
          removable: false,
          resizable: true,
        },
        community: {
          id: 'community',
          component: <Community />,
          removable: false,
          resizable: true,
        },
        settings: {
          id: 'settings',
          component: <Settings />,
          removable: false,
          resizable: true,
        },
      },
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
    const handleDashboardConfigChange = (newDashboardConfig) => {
      setDashboardConfig(newDashboardConfig);
      localStorage.setItem('dashboardConfig', JSON.stringify(newDashboardConfig));
    };
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const newLayout = { ...dashboardConfig.layout };
      const newComponents = { ...dashboardConfig.components };
      const activeComponent = newComponents[active.id];
      const overComponent = newComponents[over.id];
      const activeLayout = newLayout[active.id];
      const overLayout = newLayout[over.id];
      newLayout[active.id] = overLayout;
      newLayout[over.id] = activeLayout;
      handleDashboardConfigChange({ layout: newLayout, components: newComponents });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DashboardLayout>
        {Object.keys(dashboardConfig.components).map((componentId) => {
          const component = dashboardConfig.components[componentId];
          const layout = dashboardConfig.layout[componentId];
          return (
            <div
              key={componentId}
              style={{
                position: 'absolute',
                left: `${layout.x * 100}%`,
                top: `${layout.y * 100}%`,
                width: `${layout.width * 100}%`,
                height: `${layout.height * 100}%`,
              }}
            >
              {component.component}
            </div>
          );
        })}
      </DashboardLayout>
    </DndContext>
  );
}