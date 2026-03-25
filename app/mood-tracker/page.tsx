use client;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMoodEntries, saveMoodEntry } from '../utils/storage';
import { MoodEntry } from '../types';
import MoodTrackerForm from '../components/MoodTrackerForm';
import MoodTrackerList from '../components/MoodTrackerList';

const MoodTrackerPage = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [newMoodEntry, setNewMoodEntry] = useState<MoodEntry>({ mood: '', notes: '' });
  const router = useRouter();

  useEffect(() => {
    const storedMoodEntries = getMoodEntries();
    setMoodEntries(storedMoodEntries);
  }, []);

  const handleSaveMoodEntry = (moodEntry: MoodEntry) => {
    saveMoodEntry(moodEntry);
    setMoodEntries([...moodEntries, moodEntry]);
    setNewMoodEntry({ mood: '', notes: '' });
  };

  const handleDeleteMoodEntry = (id: number) => {
    const updatedMoodEntries = moodEntries.filter((entry) => entry.id !== id);
    setMoodEntries(updatedMoodEntries);
    localStorage.setItem('moodEntries', JSON.stringify(updatedMoodEntries));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-4">Mood Tracker</h1>
      <MoodTrackerForm
        newMoodEntry={newMoodEntry}
        setNewMoodEntry={setNewMoodEntry}
        handleSaveMoodEntry={handleSaveMoodEntry}
      />
      <MoodTrackerList
        moodEntries={moodEntries}
        handleDeleteMoodEntry={handleDeleteMoodEntry}
      />
    </div>
  );
};

export default MoodTrackerPage;