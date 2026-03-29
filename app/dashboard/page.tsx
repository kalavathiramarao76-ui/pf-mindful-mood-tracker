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
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <DashboardLayout>
      {showTutorial && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h2>{tutorialSteps[currentStep].title}</h2>
            <p>{tutorialSteps[currentStep].description}</p>
            <button onClick={handleNextStep}>Next</button>
            <button onClick={handleSkipTutorial}>Skip Tutorial</button>
          </div>
        </div>
      )}
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={Object.keys(components)} strategy={rectSortingStrategy}>
          {Object.keys(components).map((component, index) => (
            <div key={component} style={initialLayout[component]}>
              <components[component] />
            </div>
          ))}
        </SortableContext>
        <DragOverlay>
          {activeId && (
            <div
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: 'gray',
                opacity: 0.5,
              }}
            >
              {components[activeId]}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </DashboardLayout>
  );
};

export default Page;