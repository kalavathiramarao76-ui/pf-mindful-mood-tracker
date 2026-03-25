use client;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Goal } from '../types';
import GoalCard from '../components/GoalCard';
import AddGoalForm from '../components/AddGoalForm';

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    const storedGoals = localStorage.getItem('goals');
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  const handleAddGoal = () => {
    if (newGoal.trim() !== '') {
      const goal: Goal = { id: Date.now(), title: newGoal, completed: false };
      setGoals([...goals, goal]);
      setNewGoal('');
      localStorage.setItem('goals', JSON.stringify([...goals, goal]));
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setIsEditing(true);
    setEditedGoal(goal);
  };

  const handleSaveEditedGoal = (goal: Goal) => {
    const updatedGoals = goals.map((g) => (g.id === goal.id ? goal : g));
    setGoals(updatedGoals);
    setIsEditing(false);
    setEditedGoal(null);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
  };

  const handleDeleteGoal = (id: number) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
  };

  const handleToggleCompleted = (id: number) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-4">Goals</h1>
      <AddGoalForm
        newGoal={newGoal}
        setNewGoal={setNewGoal}
        handleAddGoal={handleAddGoal}
      />
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              handleEditGoal={handleEditGoal}
              handleDeleteGoal={handleDeleteGoal}
              handleToggleCompleted={handleToggleCompleted}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No goals added yet.</p>
      )}
      {isEditing && editedGoal && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-md shadow-md">
            <h2 className="text-2xl font-bold mb-2">Edit Goal</h2>
            <input
              type="text"
              value={editedGoal.title}
              onChange={(e) => setEditedGoal({ ...editedGoal, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={() => handleSaveEditedGoal(editedGoal)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-2"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md mt-2 ml-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}