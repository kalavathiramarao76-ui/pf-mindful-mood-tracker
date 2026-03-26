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

const components: Component[] = [
  { id: 'moodTracker', component: <MemoizedMoodTracker /> },
  { id: 'recommendations', component: <MemoizedRecommendations /> },
  { id: 'goals', component: <MemoizedGoals /> },
  { id: 'community', component: <MemoizedCommunity /> },
  { id: 'settings', component: <MemoizedSettings /> },
];

const initialLayout: Layout = {
  moodTracker: { x: 0, y: 0, width: 300, height: 200 },
  recommendations: { x: 300, y: 0, width: 300, height: 200 },
  goals: { x: 0, y: 200, width: 300, height: 200 },
  community: { x: 300, y: 200, width: 300, height: 200 },
  settings: { x: 0, y: 400, width: 300, height: 200 },
};

const initialDashboardConfig: DashboardConfig = {
  layout: initialLayout,
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
        moodTracker: { x: 0, y: 0, width: 100, height: 100 },
        recommendations: { x: 100, y: 0, width: 100, height: 100 },
        goals: { x: 0, y: 100, width: 100, height: 100 },
        community: { x: 100, y: 100, width: 100, height: 100 },
        settings: { x: 0, y: 200, width: 100, height: 100 },
      },
    },
    md: {
      layout: {
        moodTracker: { x: 0, y: 0, width: 200, height: 200 },
        recommendations: { x: 200, y: 0, width: 200, height: 200 },
        goals: { x: 0, y: 200, width: 200, height: 200 },
        community: { x: 200, y: 200, width: 200, height: 200 },
        settings: { x: 0, y: 400, width: 200, height: 200 },
      },
    },
    lg: {
      layout: {
        moodTracker: { x: 0, y: 0, width: 300, height: 200 },
        recommendations: { x: 300, y: 0, width: 300, height: 200 },
        goals: { x: 0, y: 200, width: 300, height: 200 },
        community: { x: 300, y: 200, width: 300, height: 200 },
        settings: { x: 0, y: 400, width: 300, height: 200 },
      },
    },
  },
};

const Page = () => {
  const [dashboardConfig, setDashboardConfig] = useState(initialDashboardConfig);
  const [dragging, setDragging] = useState(false);

  const handleDragStart = () => {
    setDragging(true);
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  const handleDrop = (event: any) => {
    event.preventDefault();
    const componentId = event.dataTransfer.getData('componentId');
    const x = event.clientX;
    const y = event.clientY;
    const component = components.find((c) => c.id === componentId);
    if (component) {
      const newLayout = { ...dashboardConfig.layout };
      newLayout[componentId] = { x, y, width: component.component.props.width, height: component.component.props.height };
      setDashboardConfig({ ...dashboardConfig, layout: newLayout });
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={components} strategy={rectSortingStrategy}>
        <DashboardLayout>
          {components.map((component) => (
            <div
              key={component.id}
              style={{
                position: 'absolute',
                left: dashboardConfig.layout[component.id].x,
                top: dashboardConfig.layout[component.id].y,
                width: dashboardConfig.layout[component.id].width,
                height: dashboardConfig.layout[component.id].height,
              }}
              draggable
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              data-component-id={component.id}
            >
              {component.component}
            </div>
          ))}
        </DashboardLayout>
      </SortableContext>
    </DndContext>
  );
};

export default Page;