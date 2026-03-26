import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
      breakpoints: {
        desktop: {
          layout: {
            moodTracker: { x: 0, y: 0, width: 1, height: 1 },
            recommendations: { x: 1, y: 0, width: 1, height: 1 },
            goals: { x: 0, y: 1, width: 1, height: 1 },
            community: { x: 1, y: 1, width: 1, height: 1 },
            settings: { x: 0, y: 2, width: 1, height: 1 },
          },
        },
        mobile: {
          layout: {
            moodTracker: { x: 0, y: 0, width: 1, height: 1 },
            recommendations: { x: 0, y: 1, width: 1, height: 1 },
            goals: { x: 0, y: 2, width: 1, height: 1 },
            community: { x: 0, y: 3, width: 1, height: 1 },
            settings: { x: 0, y: 4, width: 1, height: 1 },
          },
        },
      },
    };
  });
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const handleNextTutorialStep = () => {
    if (tutorialIndex < tutorialSteps.length - 1) {
      setTutorialIndex(tutorialIndex + 1);
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
            <h2>{tutorialSteps[tutorialIndex].title}</h2>
            <p>{tutorialSteps[tutorialIndex].description}</p>
            <button onClick={handleNextTutorialStep}>Next</button>
            <button onClick={handleSkipTutorial}>Skip</button>
          </div>
        </div>
      )}
      <DndContext collisionDetection={closestCenter}>
        <SortableContext items={Object.keys(dashboardConfig.components)} strategy={rectSortingStrategy}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridGap: '10px',
            }}
          >
            {Object.keys(dashboardConfig.components).map((componentId) => (
              <div
                key={componentId}
                style={{
                  gridColumn: dashboardConfig.layout[componentId].x,
                  gridRow: dashboardConfig.layout[componentId].y,
                  width: `${dashboardConfig.layout[componentId].width * 100}%`,
                  height: `${dashboardConfig.layout[componentId].height * 100}%`,
                }}
              >
                {dashboardConfig.components[componentId].component}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </DashboardLayout>
  );
}