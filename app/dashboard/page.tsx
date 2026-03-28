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
  const [isTutorialActive, setIsTutorialActive] = useState(true);

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsTutorialCompleted(true);
      setIsTutorialActive(false);
    }
  };

  const handleSkipTutorial = () => {
    setIsTutorialCompleted(true);
    setIsTutorialActive(false);
  };

  useEffect(() => {
    const storedTutorialStatus = localStorage.getItem('tutorialCompleted');
    if (storedTutorialStatus === 'true') {
      setIsTutorialCompleted(true);
      setIsTutorialActive(false);
    }
  }, []);

  const tutorialOverlay = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
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
  );

  return (
    <DashboardLayout>
      {isTutorialActive && tutorialOverlay}
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {components.moodTracker}
          {components.recommendations}
          {components.goals}
          {components.community}
          {components.settings}
        </SortableContext>
        <DragOverlay>{activeId ? <div>Dragging {activeId}</div> : null}</DragOverlay>
      </DndContext>
    </DashboardLayout>
  );
};

export default Page;