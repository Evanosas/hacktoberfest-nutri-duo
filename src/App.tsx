import React, { useState, useEffect } from 'react';
import {
  DashboardResponse,
  UserProfile,
  MonthlyGoal,
  MealEntry,
  HealthChallenge,
  FoodRecommendation,
} from './types';
import { DashboardView } from './components/DashboardView';
import { OnboardingModal } from './components/OnboardingModal';
import { MonthlyGoalModal } from './components/MonthlyGoalModal';
import { UploadFoodModal } from './components/UploadFoodModal';
import { QuickWaterModal } from './components/QuickWaterModal';
import { HealthChallengesModal } from './components/HealthChallengesModal';
import { ProfileModal } from './components/ProfileModal';
import { sounds } from './utils/audio';

export default function App() {
  const currentMonthKey = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 25,
    weight: 68,
    sex: 'female',
    bloodGroup: 'O+',
    currency: '$',
    activityLevel: 'moderate',
    dietPreference: 'balanced',
    streakDays: 5,
    xp: 450,
    level: 3,
    onboardingComplete: false,
  });
  const [challenges, setChallenges] = useState<HealthChallenge[]>([]);

  // Modal visibility states
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMonthlyGoalOpen, setIsMonthlyGoalOpen] = useState(false);
  const [isUploadMealOpen, setIsUploadMealOpen] = useState(false);
  const [isQuickWaterOpen, setIsQuickWaterOpen] = useState(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load Dashboard Data for selected month
  const fetchDashboard = async (month: string) => {
    try {
      const res = await fetch(`/api/dashboard/${month}`);
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
        if (data.profile) {
          setProfile(data.profile);
          if (!data.profile.onboardingComplete) {
            setIsOnboardingOpen(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load challenges
  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      if (data.success && data.challenges) {
        setChallenges(data.challenges);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedMonth);
    fetchChallenges();
  }, [selectedMonth]);

  // Handlers
  const handleSaveProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setIsOnboardingOpen(false);
        fetchDashboard(selectedMonth);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const handleSaveMonthlyGoal = async (newGoal: MonthlyGoal) => {
    try {
      const res = await fetch('/api/monthly-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboard(selectedMonth);
      }
    } catch (err) {
      console.error('Failed to save monthly goals:', err);
    }
  };

  const handleSaveMeal = async (mealData: Partial<MealEntry>) => {
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData),
      });
      const data = await res.json();
      if (data.success) {
        if (data.profile) setProfile(data.profile);
        if (data.challenges) setChallenges(data.challenges);
        fetchDashboard(selectedMonth);
      }
    } catch (err) {
      console.error('Failed to save meal:', err);
    }
  };

  const handleSaveWater = async (bottles: number, sachets: number) => {
    try {
      const res = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bottles, sachets }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.profile) setProfile(data.profile);
        if (data.challenges) setChallenges(data.challenges);
        fetchDashboard(selectedMonth);
      }
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const res = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboard(selectedMonth);
      }
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  const handleQuickLogRecommendation = (rec: FoodRecommendation) => {
    // Open meal upload modal pre-focused
    setIsUploadMealOpen(true);
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#f7f9fa] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-[#58cc02] border-2 border-[#46a302] border-b-4 flex items-center justify-center text-3xl animate-bounce mb-4 shadow-lg">
          🦉
        </div>
        <h2 className="text-xl font-fun font-bold text-[#3c3c3c]">Loading NutriDuo...</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">Calibrating your nutrition engine</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <DashboardView
        data={dashboardData}
        profile={profile}
        monthKey={selectedMonth}
        onMonthChange={(newMonth) => setSelectedMonth(newMonth)}
        onOpenUploadMeal={() => setIsUploadMealOpen(true)}
        onOpenQuickWater={() => setIsQuickWaterOpen(true)}
        onOpenMonthlyGoal={() => setIsMonthlyGoalOpen(true)}
        onOpenChallenges={() => setIsChallengesOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onDeleteMeal={handleDeleteMeal}
        onQuickLogRecommendation={handleQuickLogRecommendation}
      />

      {/* Onboarding Initial Stage Modal */}
      <OnboardingModal
        initialProfile={profile}
        isOpen={isOnboardingOpen}
        onSave={handleSaveProfile}
      />

      {/* Monthly Goals & Budget Textbox Modal */}
      <MonthlyGoalModal
        isOpen={isMonthlyGoalOpen}
        onClose={() => setIsMonthlyGoalOpen(false)}
        currentGoal={dashboardData.goal}
        monthKey={selectedMonth}
        profile={profile}
        onSave={handleSaveMonthlyGoal}
      />

      {/* Upload Food & Water Modal */}
      <UploadFoodModal
        isOpen={isUploadMealOpen}
        onClose={() => setIsUploadMealOpen(false)}
        profile={profile}
        monthKey={selectedMonth}
        onSaveMeal={handleSaveMeal}
      />

      {/* Quick Standalone Water Modal */}
      <QuickWaterModal
        isOpen={isQuickWaterOpen}
        onClose={() => setIsQuickWaterOpen(false)}
        onSaveWater={handleSaveWater}
      />

      {/* Health Challenges & AI Food Recommendations Modal */}
      <HealthChallengesModal
        isOpen={isChallengesOpen}
        onClose={() => setIsChallengesOpen(false)}
        challenges={challenges}
        profile={profile}
        remainingBudget={dashboardData.totals.remainingBudget}
        onQuickLogRecommendation={handleQuickLogRecommendation}
      />

      {/* User Profile & Blood Group Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
