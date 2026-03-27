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
), (prevProps, nextProps) => {
  // Only re-render if props change
  return prevProps === nextProps;
});
const MemoizedRecommendations = React.memo(() => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyRecommendations />
  </Suspense>
), (prevProps, nextProps) => {
  // Only re-render if props change
  return prevProps === nextProps;
});
const MemoizedGoals = React.memo(() => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyGoals />
  </Suspense>
), (prevProps, nextProps) => {
  // Only re-render if props change
  return prevProps === nextProps;
});
const MemoizedCommunity = React.memo(() => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyCommunity />
  </Suspense>
), (prevProps, nextProps) => {
  // Only re-render if props change
  return prevProps === nextProps;
});
const MemoizedSettings = React.memo(() => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazySettings />
  </Suspense>
), (prevProps, nextProps) => {
  // Only re-render if props change
  return prevProps === nextProps;
});

const DashboardPage = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    layout: {},
    components: {},
    breakpoints: {},
  });

  const [components, setComponents] = useState<Component[]>([]);

  useEffect(() => {
    // Initialize dashboard config and components
    const initialConfig: DashboardConfig = {
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
      breakpoints: {},
    };

    setDashboardConfig(initialConfig);

    const initialComponents: Component[] = [
      { id: 'moodTracker', component: <MemoizedMoodTracker /> },
      { id: 'recommendations', component: <MemoizedRecommendations /> },
      { id: 'goals', component: <MemoizedGoals /> },
      { id: 'community', component: <MemoizedCommunity /> },
      { id: 'settings', component: <MemoizedSettings /> },
    ];

    setComponents(initialComponents);
  }, []);

  const handleDragEnd = (event: any) => {
    // Update dashboard config and components on drag end
    const { id, x, y } = event;
    const updatedConfig = { ...dashboardConfig };
    updatedConfig.layout[id] = { x, y, width: 300, height: 200 };
    setDashboardConfig(updatedConfig);
  };

  return (
    <DashboardLayout>
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={components} strategy={rectSortingStrategy}>
          {components.map((component) => (
            <div key={component.id} style={{ position: 'absolute', left: dashboardConfig.layout[component.id].x, top: dashboardConfig.layout[component.id].y }}>
              {component.component}
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </DashboardLayout>
  );
};

export default DashboardPage;