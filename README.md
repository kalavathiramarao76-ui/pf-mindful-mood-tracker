# MoodWave: Personalized Mental Wellness

MoodWave is a personalized mental wellness platform that helps users track their emotions, identify patterns, and develop strategies to improve their mental health. It offers a customizable mood tracking system, personalized recommendations, and a community forum for support. Users can set goals, track progress, and receive reminders to practice self-care.

## Features

* Mood tracking: Track your emotions and identify patterns to better understand your mental health
* Personalized recommendations: Receive tailored suggestions to improve your mental well-being
* Goal setting: Set and achieve goals to enhance your mental health
* Community forum: Connect with others who share similar experiences and support one another
* Customizable dashboard: Personalize your dashboard to suit your needs
* Reminders and notifications: Stay on track with reminders and notifications to practice self-care

## Pages

* Dashboard: A personalized overview of your mental health journey
* Mood tracker: Track your emotions and identify patterns
* Recommendations: Receive personalized suggestions to improve your mental well-being
* Goals: Set and achieve goals to enhance your mental health
* Community: Connect with others who share similar experiences and support one another
* Settings: Customize your experience and preferences

## SEO Keywords

* Mental health apps
* Mood tracker
* Anxiety management
* Stress relief
* Self care

## Getting Started

To get started with MoodWave, simply create an account and begin tracking your emotions. Our platform will guide you through the process and provide you with personalized recommendations to improve your mental health.

## Technology Stack

* Next.js 14 App Router
* TypeScript
* Tailwind CSS
* Premium UI (Linear/Notion aesthetic)
* Mobile-first responsive design

## Package.json

```json
{
  "name": "moodwave",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0"
  }
}
```

## Next.config.mjs

```javascript
export default {
  experimental: {
    appDir: true,
  },
}
```

## Layout.tsx

```typescript
import type { ReactNode } from 'react';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>MoodWave: Personalized Mental Wellness</title>
        <meta name="description" content="MoodWave is a personalized mental wellness platform" />
        <meta name="keywords" content="mental health apps, mood tracker, anxiety management, stress relief, self care" />
        <meta property="og:title" content="MoodWave: Personalized Mental Wellness" />
        <meta property="og:description" content="MoodWave is a personalized mental wellness platform" />
        <meta property="og:url" content="https://moodwave.com" />
        <meta property="og:image" content="https://moodwave.com/image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MoodWave: Personalized Mental Wellness" />
        <meta name="twitter:description" content="MoodWave is a personalized mental wellness platform" />
        <meta name="twitter:image" content="https://moodwave.com/image.png" />
      </Head>
      {children}
    </>
  );
}
```

## Landing Page

```typescript
use client;

import Layout from '../components/Layout';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import PricingTable from '../components/PricingTable';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <Layout>
      <Hero />
      <FeatureGrid />
      <PricingTable />
      <FAQ />
      <Footer />
    </Layout>
  );
}
```

## Hero.tsx

```typescript
use client;

import { useState } from 'react';

export default function Hero() {
  const [gradient, setGradient] = useState('bg-gradient-to-r from-blue-500 to-purple-500');

  return (
    <div className={`h-screen ${gradient} flex justify-center items-center`}>
      <h1 className="text-5xl text-white font-bold">MoodWave</h1>
    </div>
  );
}
```

## FeatureGrid.tsx

```typescript
use client;

import { useState } from 'react';

export default function FeatureGrid() {
  const [features, setFeatures] = useState([
    { title: 'Mood Tracking', description: 'Track your emotions and identify patterns' },
    { title: 'Personalized Recommendations', description: 'Receive tailored suggestions to improve your mental well-being' },
    { title: 'Goal Setting', description: 'Set and achieve goals to enhance your mental health' },
    { title: 'Community Forum', description: 'Connect with others who share similar experiences and support one another' },
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((feature, index) => (
        <div key={index} className="bg-white p-4 rounded shadow-md">
          <h2 className="text-2xl font-bold">{feature.title}</h2>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## PricingTable.tsx

```typescript
use client;

import { useState } from 'react';

export default function PricingTable() {
  const [plans, setPlans] = useState([
    { title: 'Free', price: 0, features: ['Mood Tracking', 'Limited Recommendations'] },
    { title: 'Premium', price: 9.99, features: ['Mood Tracking', 'Personalized Recommendations', 'Goal Setting', 'Community Forum'] },
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {plans.map((plan, index) => (
        <div key={index} className="bg-white p-4 rounded shadow-md">
          <h2 className="text-2xl font-bold">{plan.title}</h2>
          <p className="text-3xl font-bold">${plan.price}/month</p>
          <ul className="list-disc pl-4">
            {plan.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

## FAQ.tsx

```typescript
use client;

import { useState } from 'react';

export default function FAQ() {
  const [questions, setQuestions] = useState([
    { title: 'What is MoodWave?', description: 'MoodWave is a personalized mental wellness platform' },
    { title: 'How do I get started?', description: 'Create an account and begin tracking your emotions' },
    { title: 'What features does MoodWave offer?', description: 'MoodWave offers mood tracking, personalized recommendations, goal setting, and a community forum' },
  ]);

  return (
    <div className="grid grid-cols-1 gap-4">
      {questions.map((question, index) => (
        <div key={index} className="bg-white p-4 rounded shadow-md">
          <h2 className="text-2xl font-bold">{question.title}</h2>
          <p className="text-gray-600">{question.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## Footer.tsx

```typescript
use client;

export default function Footer() {
  return (
    <div className="bg-gray-200 p-4 text-center">
      <p>&copy; 2024 MoodWave</p>
    </div>
  );
}