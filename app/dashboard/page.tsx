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

const componentsMap = {
  moodTracker: <MemoizedMoodTracker />,
  recommendations: <MemoizedRecommendations />,
  goals: <MemoizedGoals />,
  community: <MemoizedCommunity />,
  settings: <MemoizedSettings />,
};

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
    const initialComponents = Object.keys(componentsMap).map((key) => ({
      id: key,
      component: componentsMap[key],
    }));
    setComponents(initialComponents);
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setComponents((components) => {
        const newComponents = [...components];
        const [removed] = newComponents.splice(newComponents.findIndex((component) => component.id === active.id), 1);
        newComponents.splice(newComponents.findIndex((component) => component.id === over.id), 0, removed);
        return newComponents;
      });
    }
  };

  const handleResize = (componentId: string, newDimensions: { width: number; height: number }) => {
    setComponents((components) =>
      components.map((component) => {
        if (component.id === componentId) {
          return { ...component, width: newDimensions.width, height: newDimensions.height };
        }
        return component;
      })
    );
  };

  return (
    <DashboardLayout>
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={components} strategy={rectSortingStrategy}>
          {components.map((component, index) => (
            <div key={component.id} style={{ width: component.component.props.width, height: component.component.props.height }}>
              {component.component}
            </div>
          ))}
        </SortableContext>
        <DragOverlay>
          {components.map((component) => (
            <div key={component.id}>{component.component}</div>
          ))}
        </DragOverlay>
      </DndContext>
    </DashboardLayout>
  );
};

export default DashboardPage;