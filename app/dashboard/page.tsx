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
  action: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to MoodWave',
    description: 'This is your personalized mental wellness dashboard.',
    target: 'dashboard',
    action: () => console.log('Welcome to MoodWave'),
  },
  {
    title: 'Mood Tracker',
    description: 'Track your mood and emotions over time.',
    target: 'moodTracker',
    action: () => console.log('Mood Tracker'),
  },
  {
    title: 'Recommendations',
    description: 'Get personalized recommendations for improving your mental well-being.',
    target: 'recommendations',
    action: () => console.log('Recommendations'),
  },
  {
    title: 'Goals',
    description: 'Set and track your goals for achieving better mental health.',
    target: 'goals',
    action: () => console.log('Goals'),
  },
  {
    title: 'Community',
    description: 'Connect with others who share similar interests and goals.',
    target: 'community',
    action: () => console.log('Community'),
  },
  {
    title: 'Settings',
    description: 'Customize your dashboard to fit your needs.',
    target: 'settings',
    action: () => console.log('Settings'),
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

const components = {
  moodTracker: loadComponent('mood-tracker'),
  recommendations: loadComponent('recommendations'),
  goals: loadComponent('goals'),
  community: loadComponent('community'),
  settings: loadComponent('settings'),
};

const initialLayout: Layout = {
  moodTracker: { x: 0, y: 0, width: 300, height: 200 },
  recommendations: { x: 300, y: 0, width: 300, height: 200 },
  goals: { x: 0, y: 200, width: 300, height: 200 },
  community: { x: 300, y: 200, width: 300, height: 200 },
  settings: { x: 0, y: 400, width: 300, height: 200 },
};

const Page = () => {
  const [layout, setLayout] = useState(initialLayout);

  const handleDragEnd = (event: any) => {
    const { id, x, y } = event;
    setLayout((prevLayout) => ({ ...prevLayout, [id]: { x, y, width: prevLayout[id].width, height: prevLayout[id].height } }));
  };

  const handleResize = (id: string, width: number, height: number) => {
    setLayout((prevLayout) => ({ ...prevLayout, [id]: { x: prevLayout[id].x, y: prevLayout[id].y, width, height } }));
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={Object.keys(layout)} strategy={rectSortingStrategy}>
        <DashboardLayout>
          {Object.keys(layout).map((id) => (
            <div
              key={id}
              style={{
                position: 'absolute',
                top: layout[id].y,
                left: layout[id].x,
                width: layout[id].width,
                height: layout[id].height,
                border: '1px solid black',
                resize: 'both',
                overflow: 'auto',
              }}
              onResize={(e) => handleResize(id, e.target.offsetWidth, e.target.offsetHeight)}
            >
              {components[id]}
            </div>
          ))}
        </DashboardLayout>
      </SortableContext>
    </DndContext>
  );
};

export default Page;