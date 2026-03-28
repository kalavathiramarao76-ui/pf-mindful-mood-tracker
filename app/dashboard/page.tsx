import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardLayout from '../layout/dashboard-layout';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { lazy, Suspense } from 'react';

const LazyMoodTracker = lazy(() => import('../components/mood-tracker'));
const LazyRecommendations = lazy(() => import('../components/recommendations'));
const LazyGoals = lazy(() => import('../components/goals'));
const LazyCommunity = lazy(() => import('../components/community'));
const LazySettings = lazy(() => import('../components/settings'));

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

interface TutorialStep {
  title: string;
  description: string;
  target: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to MoodWave',
    description: 'This is your personalized mental wellness dashboard.',
    target: 'dashboard',
  },
  {
    title: 'Mood Tracker',
    description: 'Track your mood and emotions over time.',
    target: 'moodTracker',
  },
  {
    title: 'Recommendations',
    description: 'Get personalized recommendations for improving your mental well-being.',
    target: 'recommendations',
  },
  {
    title: 'Goals',
    description: 'Set and track your goals for achieving better mental health.',
    target: 'goals',
  },
  {
    title: 'Community',
    description: 'Connect with others who share similar interests and goals.',
    target: 'community',
  },
  {
    title: 'Settings',
    description: 'Customize your dashboard to fit your needs.',
    target: 'settings',
  },
];

const loadComponent = (component: any) => {
  const Component = lazy(() => import(`../components/${component}`));
  return React.memo(() => (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  ));
};

const MemoizedMoodTracker = loadComponent('mood-tracker');
const MemoizedRecommendations = loadComponent('recommendations');
const MemoizedGoals = loadComponent('goals');
const MemoizedCommunity = loadComponent('community');
const MemoizedSettings = loadComponent('settings');

const components = {
  moodTracker: <MemoizedMoodTracker />,
  recommendations: <MemoizedRecommendations />,
  goals: <MemoizedGoals />,
  community: <MemoizedCommunity />,
  settings: <MemoizedSettings />,
};

const Page = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTutorialCompleted, setIsTutorialCompleted] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    layout: {
      moodTracker: { x: 0, y: 0, width: 300, height: 200 },
      recommendations: { x: 300, y: 0, width: 300, height: 200 },
      goals: { x: 0, y: 200, width: 300, height: 200 },
      community: { x: 300, y: 200, width: 300, height: 200 },
      settings: { x: 0, y: 400, width: 300, height: 200 },
    },
    components: {
      moodTracker: {
        id: 'moodTracker',
        component: components.moodTracker,
        removable: false,
        resizable: true,
      },
      recommendations: {
        id: 'recommendations',
        component: components.recommendations,
        removable: false,
        resizable: true,
      },
      goals: {
        id: 'goals',
        component: components.goals,
        removable: false,
        resizable: true,
      },
      community: {
        id: 'community',
        component: components.community,
        removable: false,
        resizable: true,
      },
      settings: {
        id: 'settings',
        component: components.settings,
        removable: false,
        resizable: true,
      },
    },
    breakpoints: {
      sm: {
        layout: {
          moodTracker: { x: 0, y: 0, width: 200, height: 150 },
          recommendations: { x: 200, y: 0, width: 200, height: 150 },
          goals: { x: 0, y: 150, width: 200, height: 150 },
          community: { x: 200, y: 150, width: 200, height: 150 },
          settings: { x: 0, y: 300, width: 200, height: 150 },
        },
      },
      md: {
        layout: {
          moodTracker: { x: 0, y: 0, width: 250, height: 200 },
          recommendations: { x: 250, y: 0, width: 250, height: 200 },
          goals: { x: 0, y: 200, width: 250, height: 200 },
          community: { x: 250, y: 200, width: 250, height: 200 },
          settings: { x: 0, y: 400, width: 250, height: 200 },
        },
      },
      lg: {
        layout: {
          moodTracker: { x: 0, y: 0, width: 300, height: 250 },
          recommendations: { x: 300, y: 0, width: 300, height: 250 },
          goals: { x: 0, y: 250, width: 300, height: 250 },
          community: { x: 300, y: 250, width: 300, height: 250 },
          settings: { x: 0, y: 500, width: 300, height: 250 },
        },
      },
    },
  });

  const handleResize = (id: string, width: number, height: number) => {
    setDashboardConfig((prevConfig) => ({
      ...prevConfig,
      layout: {
        ...prevConfig.layout,
        [id]: { ...prevConfig.layout[id], width, height },
      },
    }));
  };

  const handleRemove = (id: string) => {
    setDashboardConfig((prevConfig) => ({
      ...prevConfig,
      components: {
        ...prevConfig.components,
        [id]: { ...prevConfig.components[id], removable: false },
      },
    }));
  };

  const handleAdd = (id: string) => {
    setDashboardConfig((prevConfig) => ({
      ...prevConfig,
      components: {
        ...prevConfig.components,
        [id]: { ...prevConfig.components[id], removable: true },
      },
    }));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setDashboardConfig((prevConfig) => ({
        ...prevConfig,
        layout: {
          ...prevConfig.layout,
          [active.id]: { ...prevConfig.layout[active.id], x: over.x, y: over.y },
        },
      }));
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={Object.keys(dashboardConfig.components)} strategy={rectSortingStrategy}>
        <DashboardLayout>
          {Object.keys(dashboardConfig.components).map((id) => (
            <div
              key={id}
              style={{
                position: 'absolute',
                top: dashboardConfig.layout[id].y,
                left: dashboardConfig.layout[id].x,
                width: dashboardConfig.layout[id].width,
                height: dashboardConfig.layout[id].height,
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
                    backgroundColor: 'gray',
                    cursor: 'nwse-resize',
                  }}
                  onMouseDown={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const startX = event.clientX;
                    const startY = event.clientY;
                    const startWidth = dashboardConfig.layout[id].width;
                    const startHeight = dashboardConfig.layout[id].height;
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
              {dashboardConfig.components[id].removable && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 20,
                    height: 20,
                    backgroundColor: 'red',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleRemove(id)}
                >
                  X
                </div>
              )}
              {!dashboardConfig.components[id].removable && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 20,
                    height: 20,
                    backgroundColor: 'green',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleAdd(id)}
                >
                  +
                </div>
              )}
            </div>
          ))}
        </DashboardLayout>
      </SortableContext>
    </DndContext>
  );
};

export default Page;