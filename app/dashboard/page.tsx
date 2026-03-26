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
  breakpoints: {
    [key: string]: {
      layout: Layout;
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
      breakpoints: {
        sm: {
          layout: {
            moodTracker: { x: 0, y: 0, width: 1, height: 1 },
            recommendations: { x: 0, y: 1, width: 1, height: 1 },
            goals: { x: 0, y: 2, width: 1, height: 1 },
            community: { x: 0, y: 3, width: 1, height: 1 },
            settings: { x: 0, y: 4, width: 1, height: 1 },
          },
        },
        md: {
          layout: {
            moodTracker: { x: 0, y: 0, width: 1, height: 1 },
            recommendations: { x: 1, y: 0, width: 1, height: 1 },
            goals: { x: 0, y: 1, width: 1, height: 1 },
            community: { x: 1, y: 1, width: 1, height: 1 },
            settings: { x: 0, y: 2, width: 1, height: 1 },
          },
        },
        lg: {
          layout: {
            moodTracker: { x: 0, y: 0, width: 2, height: 1 },
            recommendations: { x: 2, y: 0, width: 1, height: 1 },
            goals: { x: 0, y: 1, width: 1, height: 1 },
            community: { x: 1, y: 1, width: 1, height: 1 },
            settings: { x: 2, y: 1, width: 1, height: 1 },
          },
        },
      },
    };
  });

  const handleResize = (id: string, width: number, height: number) => {
    const newConfig = { ...dashboardConfig };
    newConfig.components[id].width = width;
    newConfig.components[id].height = height;
    setDashboardConfig(newConfig);
  };

  const handleMove = (id: string, x: number, y: number) => {
    const newConfig = { ...dashboardConfig };
    newConfig.components[id].x = x;
    newConfig.components[id].y = y;
    setDashboardConfig(newConfig);
  };

  const handleRemove = (id: string) => {
    const newConfig = { ...dashboardConfig };
    delete newConfig.components[id];
    setDashboardConfig(newConfig);
  };

  const getLayout = () => {
    const width = window.innerWidth;
    if (width < 768) {
      return dashboardConfig.breakpoints.sm.layout;
    } else if (width < 1024) {
      return dashboardConfig.breakpoints.md.layout;
    } else {
      return dashboardConfig.breakpoints.lg.layout;
    }
  };

  return (
    <DndContext onDragEnd={handleMove}>
      <SortableContext items={Object.keys(dashboardConfig.components)} strategy={rectSortingStrategy}>
        <DashboardLayout>
          {Object.keys(dashboardConfig.components).map((id) => (
            <div
              key={id}
              style={{
                position: 'absolute',
                left: `${getLayout()[id].x * 100}%`,
                top: `${getLayout()[id].y * 100}%`,
                width: `${getLayout()[id].width * 100}%`,
                height: `${getLayout()[id].height * 100}%`,
              }}
            >
              {dashboardConfig.components[id].component}
              {dashboardConfig.components[id].resizable && (
                <button onClick={() => handleResize(id, getLayout()[id].width + 1, getLayout()[id].height + 1)}>Resize</button>
              )}
              {dashboardConfig.components[id].removable && (
                <button onClick={() => handleRemove(id)}>Remove</button>
              )}
            </div>
          ))}
        </DashboardLayout>
      </SortableContext>
    </DndContext>
  );
}