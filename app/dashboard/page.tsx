import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardLayout from '../layout/dashboard-layout';
import MoodTracker from '../components/mood-tracker';
import Recommendations from '../components/recommendations';
import Goals from '../components/goals';
import Community from '../components/community';
import Settings from '../components/settings';
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

const MemoizedMoodTracker = React.memo(() => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyMoodTracker />
  </Suspense>
));
const MemoizedRecommendations = React.memo(() => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyRecommendations />
  </Suspense>
));
const MemoizedGoals = React.memo(() => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyGoals />
  </Suspense>
));
const MemoizedCommunity = React.memo(() => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyCommunity />
  </Suspense>
));
const MemoizedSettings = React.memo(() => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazySettings />
  </Suspense>
));

const Page = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    layout: {
      moodTracker: { x: 0, y: 0, width: 300, height: 300 },
      recommendations: { x: 300, y: 0, width: 300, height: 300 },
      goals: { x: 0, y: 300, width: 300, height: 300 },
      community: { x: 300, y: 300, width: 300, height: 300 },
      settings: { x: 600, y: 0, width: 300, height: 300 },
    },
    components: {
      moodTracker: {
        id: 'moodTracker',
        component: <MemoizedMoodTracker />,
        removable: false,
        resizable: true,
      },
      recommendations: {
        id: 'recommendations',
        component: <MemoizedRecommendations />,
        removable: false,
        resizable: true,
      },
      goals: {
        id: 'goals',
        component: <MemoizedGoals />,
        removable: false,
        resizable: true,
      },
      community: {
        id: 'community',
        component: <MemoizedCommunity />,
        removable: false,
        resizable: true,
      },
      settings: {
        id: 'settings',
        component: <MemoizedSettings />,
        removable: false,
        resizable: true,
      },
    },
    breakpoints: {
      sm: {
        layout: {
          moodTracker: { x: 0, y: 0, width: 300, height: 300 },
          recommendations: { x: 0, y: 300, width: 300, height: 300 },
          goals: { x: 0, y: 600, width: 300, height: 300 },
          community: { x: 0, y: 900, width: 300, height: 300 },
          settings: { x: 0, y: 1200, width: 300, height: 300 },
        },
      },
    },
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setDashboardConfig((prevConfig) => {
        const newConfig = { ...prevConfig };
        const activeComponent = newConfig.components[active.id];
        const overComponent = newConfig.components[over.id];
        const newLayout = { ...newConfig.layout };
        newLayout[active.id] = newLayout[over.id];
        newLayout[over.id] = active.rect;
        newConfig.layout = newLayout;
        return newConfig;
      });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DragOverlay>
        {dashboardConfig.components[Object.keys(dashboardConfig.components).find((key) => dashboardConfig.components[key].component === dashboardConfig.components[Object.keys(dashboardConfig.components).find((key) => dashboardConfig.components[key].component === dashboardConfig.components[key].component)].component)]?.component}
      </DragOverlay>
      <DashboardLayout>
        <SortableContext items={Object.keys(dashboardConfig.components)} strategy={rectSortingStrategy}>
          {Object.keys(dashboardConfig.components).map((key) => (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: dashboardConfig.layout[key].y,
                left: dashboardConfig.layout[key].x,
                width: dashboardConfig.layout[key].width,
                height: dashboardConfig.layout[key].height,
              }}
            >
              {dashboardConfig.components[key].component}
            </div>
          ))}
        </SortableContext>
      </DashboardLayout>
    </DndContext>
  );
};

export default Page;