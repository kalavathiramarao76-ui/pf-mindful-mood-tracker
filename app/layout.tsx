use client;

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <html lang="en" className="scroll-smooth">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MoodWave: Personalized Mental Wellness</title>
        <meta
          name="description"
          content="MoodWave is a personalized mental wellness platform that helps users track their emotions, identify patterns, and develop strategies to improve their mental health."
        />
        <meta
          name="keywords"
          content="mental health apps, mood tracker, anxiety management, stress relief, self care"
        />
        <meta name="author" content="MoodWave" />
        <meta name="theme-color" content="#3498db" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-200">
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
          <nav className="container mx-auto px-4 py-2 flex justify-between items-center">
            <Link href="/" className="text-lg font-bold">
              MoodWave
            </Link>
            <ul className="flex items-center space-x-4">
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link href="/mood-tracker">Mood Tracker</Link>
              </li>
              <li>
                <Link href="/recommendations">Recommendations</Link>
              </li>
              <li>
                <Link href="/goals">Goals</Link>
              </li>
              <li>
                <Link href="/community">Community</Link>
              </li>
              <li>
                <Link href="/settings">Settings</Link>
              </li>
            </ul>
            <button
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 px-4 rounded-md"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </nav>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="bg-gray-200 dark:bg-gray-700 py-4 text-center">
          <p>&copy; 2024 MoodWave. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}