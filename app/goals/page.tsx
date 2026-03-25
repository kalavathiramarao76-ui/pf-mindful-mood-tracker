import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Goal } from '../types';
import GoalCard from '../components/GoalCard';
import AddGoalForm from '../components/AddGoalForm';

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Map<number, Goal>>(new Map());
  const [newGoal, setNewGoal] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    const storedGoals = localStorage.getItem('goals');
    if (storedGoals) {
      const parsedGoals: Goal[] = JSON.parse(storedGoals);
      const goalsMap = new Map<number, Goal>();
      parsedGoals.forEach((goal) => goalsMap.set(goal.id, goal));
      setGoals(goalsMap);
    }
  }, []);

  const handleAddGoal = () => {
    if (newGoal.trim() !== '') {
      const goal: Goal = { id: Date.now(), title: newGoal, completed: false };
      setGoals((prevGoals) => new Map([...prevGoals, [goal.id, goal]]));
      setNewGoal('');
      localStorage.setItem('goals', JSON.stringify([...goals].map(([_, goal]) => goal)));
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setIsEditing(true);
    setEditedGoal(goal);
  };

  const handleSaveEditedGoal = (goal: Goal) => {
    setGoals((prevGoals) => {
      const updatedGoals = new Map([...prevGoals]);
      updatedGoals.set(goal.id, goal);
      return updatedGoals;
    });
    setIsEditing(false);
    setEditedGoal(null);
    localStorage.setItem('goals', JSON.stringify([...goals].map(([_, goal]) => goal)));
  };

  const handleDeleteGoal = (id: number) => {
    setGoals((prevGoals) => {
      const updatedGoals = new Map([...prevGoals]);
      updatedGoals.delete(id);
      return updatedGoals;
    });
    localStorage.setItem('goals', JSON.stringify([...goals].map(([_, goal]) => goal)));
  };

  const handleToggleCompleted = (id: number) => {
    setGoals((prevGoals) => {
      const updatedGoals = new Map([...prevGoals]);
      const goal = updatedGoals.get(id);
      if (goal) {
        updatedGoals.set(id, { ...goal, completed: !goal.completed });
      }
      return updatedGoals;
    });
    localStorage.setItem('goals', JSON.stringify([...goals].map(([_, goal]) => goal)));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-4">Goals</h1>
      <AddGoalForm
        newGoal={newGoal}
        setNewGoal={setNewGoal}
        handleAddGoal={handleAddGoal}
      />
      {goals.size > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...goals].map(([_, goal]) => (
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
            />
            <button onClick={() => handleSaveEditedGoal(editedGoal)}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}