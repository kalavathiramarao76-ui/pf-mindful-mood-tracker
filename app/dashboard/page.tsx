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

const initialComponents = {
  moodTracker: {
    id: 'moodTracker',
    component: <LazyMoodTracker />,
    removable: false,
    resizable: true,
  },
  recommendations: {
    id: 'recommendations',
    component: <LazyRecommendations />,
    removable: false,
    resizable: true,
  },
  goals: {
    id: 'goals',
    component: <LazyGoals />,
    removable: false,
    resizable: true,
  },
  community: {
    id: 'community',
    component: <LazyCommunity />,
    removable: false,
    resizable: true,
  },
  settings: {
    id: 'settings',
    component: <LazySettings />,
    removable: false,
    resizable: true,
  },
};

const initialDashboardConfig: DashboardConfig = {
  layout: initialLayout,
  components: initialComponents,
  breakpoints: {},
};

const DashboardPage = () => {
  const [activeComponent, setActiveComponent] = useState('moodTracker');
  const [showTutorial, setShowTutorial] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState(initialDashboardConfig);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setDashboardConfig((prevConfig) => {
        const newLayout = { ...prevConfig.layout };
        const newComponents = { ...prevConfig.components };
        const activeComponent = newComponents[active.id];
        const overComponent = newComponents[over.id];
        newLayout[active.id] = overComponent.layout;
        newLayout[over.id] = activeComponent.layout;
        return { ...prevConfig, layout: newLayout };
      });
    }
  };

  const handleResize = (id: string, newDimensions: { width: number; height: number }) => {
    setDashboardConfig((prevConfig) => {
      const newLayout = { ...prevConfig.layout };
      newLayout[id] = { ...newLayout[id], ...newDimensions };
      return { ...prevConfig, layout: newLayout };
    });
  };

  const handleRemove = (id: string) => {
    setDashboardConfig((prevConfig) => {
      const newComponents = { ...prevConfig.components };
      delete newComponents[id];
      const newLayout = { ...prevConfig.layout };
      delete newLayout[id];
      return { ...prevConfig, components: newComponents, layout: newLayout };
    });
  };

  const handleAdd = (id: string) => {
    setDashboardConfig((prevConfig) => {
      const newComponents = { ...prevConfig.components };
      newComponents[id] = {
        id,
        component: components[id],
        removable: true,
        resizable: true,
      };
      const newLayout = { ...prevConfig.layout };
      newLayout[id] = { x: 0, y: 0, width: 300, height: 200 };
      return { ...prevConfig, components: newComponents, layout: newLayout };
    });
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
                left: dashboardConfig.layout[id].x,
                top: dashboardConfig.layout[id].y,
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
                    const startWidth = rect.width;
                    const startHeight = rect.height;
                    const handleMouseMove = (event: any) => {
                      const newWidth = startWidth + (event.clientX - startX);
                      const newHeight = startHeight + (event.clientY - startY);
                      handleResize(id, { width: newWidth, height: newHeight });
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
                    width: 10,
                    height: 10,
                    backgroundColor: 'red',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleRemove(id)}
                >
                  X
                </div>
              )}
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: 10,
              backgroundColor: 'white',
              border: '1px solid gray',
            }}
          >
            <button onClick={() => handleAdd('moodTracker')}>Add Mood Tracker</button>
            <button onClick={() => handleAdd('recommendations')}>Add Recommendations</button>
            <button onClick={() => handleAdd('goals')}>Add Goals</button>
            <button onClick={() => handleAdd('community')}>Add Community</button>
            <button onClick={() => handleAdd('settings')}>Add Settings</button>
          </div>
        </DashboardLayout>
      </SortableContext>
    </DndContext>
  );
};

export default DashboardPage;