use client;

import { useState } from 'react';
import Link from 'next/link';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Page() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', darkMode ? 'false' : 'true');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-gray-900 py-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-gray-900 dark:text-white">
            MoodWave
          </Link>
          <button
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 px-4 rounded-md"
            onClick={toggleDarkMode}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </nav>
      </header>
      <main>
        <section className="bg-gradient-to-r from-blue-500 to-purple-500 h-screen">
          <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
            <h1 className="text-5xl font-bold text-white">MoodWave</h1>
            <p className="text-lg text-white">Personalized Mental Wellness</p>
            <Link
              href="/dashboard"
              className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-2 px-4 rounded-md"
            >
              Get Started
              <AiOutlineArrowRight className="ml-2" />
            </Link>
          </div>
        </section>
        <section className="bg-white dark:bg-gray-900 py-12">
          <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mood Tracking</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track your emotions and identify patterns to improve your mental health.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personalized Recommendations</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive tailored advice and strategies to enhance your mental well-being.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Goal Setting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set and achieve goals to improve your mental health and overall well-being.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Community Forum</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect with others who share similar experiences and support one another.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customizable Dashboard</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Personalize your dashboard to suit your needs and preferences.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reminders and Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stay on track with reminders and notifications to practice self-care.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-gray-100 dark:bg-gray-800 py-12">
          <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Free</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Limited features and support.
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">$0/month</p>
              </div>
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Premium</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full access to features and support.
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">$9.99/month</p>
              </div>
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pro</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced features and priority support.
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">$19.99/month</p>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white dark:bg-gray-900 py-12">
          <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">What is MoodWave?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  MoodWave is a personalized mental wellness platform that helps users track their emotions, identify patterns, and develop strategies to improve their mental health.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">How does MoodWave work?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  MoodWave uses a combination of mood tracking, personalized recommendations, and goal setting to help users improve their mental health.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-4 px-6 rounded-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Is MoodWave secure?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes, MoodWave takes the security and privacy of its users seriously, using industry-standard encryption and secure storage to protect user data.
                </p>
              </div>
            </div>
          </div>
        </section>
        <footer className="bg-gray-100 dark:bg-gray-800 py-12">
          <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; 2024 MoodWave. All rights reserved.
              </p>
              <div className="flex justify-between items-center">
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <FaFacebook className="mr-2" />
                </a>
                <a
                  href="https://www.twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <FaTwitter className="mr-2" />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <FaInstagram className="mr-2" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}