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
    const { id, x, y } = event.active.id;
    setDashboardConfig((prevConfig) => {
      const newConfig = { ...prevConfig };
      newConfig.layout[id] = { x, y, width: newConfig.layout[id].width, height: newConfig.layout[id].height };
      return newConfig;
    });
  };

  const handleResize = (id: string, width: number, height: number) => {
    setDashboardConfig((prevConfig) => {
      const newConfig = { ...prevConfig };
      newConfig.layout[id] = { x: newConfig.layout[id].x, y: newConfig.layout[id].y, width, height };
      return newConfig;
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DashboardLayout>
        {Object.keys(dashboardConfig.components).map((id) => (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: `${dashboardConfig.layout[id].x * 100}%`,
              top: `${dashboardConfig.layout[id].y * 100}%`,
              width: `${dashboardConfig.layout[id].width * 100}%`,
              height: `${dashboardConfig.layout[id].height * 100}%`,
              border: '1px solid black',
              backgroundColor: 'white',
              overflow: 'auto',
            }}
          >
            {dashboardConfig.components[id].component}
            {dashboardConfig.components[id].resizable && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  backgroundColor: 'black',
                  cursor: 'nwse-resize',
                }}
                onMouseDown={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const startX = event.clientX;
                  const startY = event.clientY;
                  const startWidth = rect.width;
                  const startHeight = rect.height;
                  const handleMouseMove = (event: any) => {
                    const newWidth = startWidth + (event.clientX - startX);
                    const newHeight = startHeight + (event.clientY - startY);
                    handleResize(id, newWidth, newHeight);
                  };
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            )}
          </div>
        ))}
      </DashboardLayout>
    </DndContext>
  );
}