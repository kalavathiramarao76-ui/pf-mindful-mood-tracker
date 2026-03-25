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

  const handleDragEnd = (event: any) => {
    const { id, x, y } = event.active;
    const { components } = dashboardConfig;
    const updatedComponents = { ...components };
    updatedComponents[id].x = x;
    updatedComponents[id].y = y;
    setDashboardConfig((prevConfig) => ({ ...prevConfig, components: updatedComponents }));
  };

  const handleDragStart = (event: any) => {
    const { id } = event.active;
    const { components } = dashboardConfig;
    const updatedComponents = { ...components };
    updatedComponents[id].width = event.active.rect.width;
    updatedComponents[id].height = event.active.rect.height;
    setDashboardConfig((prevConfig) => ({ ...prevConfig, components: updatedComponents }));
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} collisionDetection={closestCenter}>
      <DragOverlay>
        {({ dragging }) =>
          dragging ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.5,
                backgroundColor: 'gray',
                zIndex: 1000,
              }}
            />
          ) : null
        }
      </DragOverlay>
      <DashboardLayout>
        <SortableContext items={Object.keys(dashboardConfig.components)} strategy={rectSortingStrategy}>
          {Object.keys(dashboardConfig.components).map((id) => (
            <div
              key={id}
              style={{
                position: 'absolute',
                top: `${dashboardConfig.components[id].y * 100}%`,
                left: `${dashboardConfig.components[id].x * 100}%`,
                width: `${dashboardConfig.components[id].width * 100}%`,
                height: `${dashboardConfig.components[id].height * 100}%`,
                border: '1px solid black',
                backgroundColor: 'white',
              }}
            >
              {dashboardConfig.components[id].component}
            </div>
          ))}
        </SortableContext>
      </DashboardLayout>
    </DndContext>
  );
}