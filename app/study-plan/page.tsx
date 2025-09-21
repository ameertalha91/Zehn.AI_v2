"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Clock, BookOpen, Video, PenTool, FileText, Target, TrendingUp, Calendar, ArrowLeft, BarChart3, Award, Zap } from 'lucide-react';
import Link from 'next/link';

interface StudyTask {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'quiz' | 'essay' | 'reading' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  subject: string;
}

interface WeekPlan {
  weekNumber: number;
  theme: string;
  description: string;
  tasks: StudyTask[];
  totalHours: number;
  completionRate: number;
}

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  weeks: WeekPlan[];
  totalWeeks: number;
  overallProgress: number;
  lastUpdated: string;
}

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);
  const [view, setView] = useState<'overview' | 'detailed'>('detailed');

  useEffect(() => {
    fetchStudyPlan();
  }, []);

  const fetchStudyPlan = async () => {
    try {
      const response = await fetch('/api/study-plan');
      const data = await response.json();
      if (data.success) {
        setPlan(data.plan);
        
        // Set active week to first incomplete week
        const firstIncompleteWeek = data.plan.weeks.find((week: WeekPlan) => 
          week.completionRate < 100
        );
        if (firstIncompleteWeek) {
          setActiveWeek(firstIncompleteWeek.weekNumber);
        }
      }
    } catch (error) {
      console.error('Failed to fetch study plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-task',
          taskId,
          completed: !currentStatus
        })
      });

      if (response.ok) {
        // Update local state
        setPlan(prevPlan => {
          if (!prevPlan) return prevPlan;
          
          const updatedWeeks = prevPlan.weeks.map(week => ({
            ...week,
            tasks: week.tasks.map(task => 
              task.id === taskId 
                ? { ...task, completed: !currentStatus }
                : task
            )
          }));

          // Recalculate completion rates
          const updatedWeeksWithRates = updatedWeeks.map(week => {
            const completedTasks = week.tasks.filter(task => task.completed).length;
            const completionRate = (completedTasks / week.tasks.length) * 100;
            return { ...week, completionRate };
          });

          // Recalculate overall progress
          const totalTasks = updatedWeeksWithRates.reduce((sum, week) => sum + week.tasks.length, 0);
          const completedTasks = updatedWeeksWithRates.reduce((sum, week) => 
            sum + week.tasks.filter(task => task.completed).length, 0
          );
          const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return {
            ...prevPlan,
            weeks: updatedWeeksWithRates,
            overallProgress
          };
        });
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      case 'essay': return <PenTool className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'practice': return <FileText className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-blue-600 bg-blue-100';
      case 'advanced': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized study plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Study Plan Not Available</h2>
          <p className="text-gray-600 mb-4">We couldn&apos;t load your study plan. Please try again.</p>
          <button 
            onClick={fetchStudyPlan}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeWeekData = plan.weeks.find(week => week.weekNumber === activeWeek);
  const totalTasks = plan.weeks.reduce((sum, week) => sum + week.tasks.length, 0);
  const completedTasks = plan.weeks.reduce((sum, week) => 
    sum + week.tasks.filter(task => task.completed).length, 0
  );
  const totalHours = plan.weeks.reduce((sum, week) => sum + week.totalHours, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
                <p className="text-gray-600">{plan.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('detailed')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    view === 'detailed' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Detailed View
                </button>
                <button
                  onClick={() => setView('overview')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    view === 'overview' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Progress Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-3xl font-bold text-blue-600">{Math.round(plan.overallProgress)}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${plan.overallProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">of {totalTasks} total tasks</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Hours</p>
                <p className="text-3xl font-bold text-purple-600">{totalHours}h</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">total planned</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Week</p>
                <p className="text-3xl font-bold text-orange-600">{activeWeek}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {activeWeekData?.theme.substring(0, 20)}...
            </p>
          </div>
        </div>

        {view === 'overview' ? (
          // Overview View
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">6-Week Study Overview</h2>
              <p className="text-gray-600 mt-2">Track your progress across all weeks</p>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plan.weeks.map((week) => (
                  <div 
                    key={week.weekNumber}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      activeWeek === week.weekNumber ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setActiveWeek(week.weekNumber);
                      setView('detailed');
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">Week {week.weekNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        week.completionRate === 100 
                          ? 'bg-green-100 text-green-800'
                          : week.completionRate > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {Math.round(week.completionRate)}%
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{week.theme}</h4>
                    <p className="text-sm text-gray-600 mb-3">{week.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {week.totalHours} hours
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="w-4 h-4 mr-2" />
                        {week.tasks.length} tasks
                      </div>
                    </div>

                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${week.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Detailed View
          <>
            {/* Week Navigation */}
            <div className="bg-white rounded-xl shadow-sm border mb-8">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Weekly Study Plan</h2>
                <p className="text-gray-600 mt-2">Click on a week to view detailed tasks</p>
              </div>
              
              <div className="p-6">
                <div className="flex space-x-3 overflow-x-auto">
                  {plan.weeks.map((week) => (
                    <button
                      key={week.weekNumber}
                      onClick={() => setActiveWeek(week.weekNumber)}
                      className={`flex-shrink-0 px-6 py-4 rounded-lg font-medium transition-all ${
                        activeWeek === week.weekNumber
                          ? 'bg-blue-600 text-white shadow-lg'
                          : week.completionRate === 100
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">Week {week.weekNumber}</div>
                        <div className="text-sm opacity-75">{Math.round(week.completionRate)}% complete</div>
                        <div className="text-xs opacity-60 mt-1">{week.totalHours}h</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Week Content */}
            {activeWeekData && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Week {activeWeekData.weekNumber}: {activeWeekData.theme}
                      </h3>
                      <p className="text-gray-600">{activeWeekData.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {Math.round(activeWeekData.completionRate)}%
                      </div>
                      <div className="text-sm text-gray-600">Complete</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {activeWeekData.totalHours} hours total
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="w-4 h-4 mr-2" />
                      {activeWeekData.tasks.filter(task => task.completed).length}/{activeWeekData.tasks.length} tasks completed
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="w-4 h-4 mr-2" />
                      {activeWeekData.tasks.filter(task => task.priority === 'high').length} high priority
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-6">
                  <div className="space-y-4">
                    {activeWeekData.tasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`border rounded-lg p-6 transition-all ${
                          task.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <button
                            onClick={() => toggleTaskCompletion(task.id, task.completed)}
                            className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
                          >
                            {task.completed ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="flex items-center space-x-2">
                                {getTaskIcon(task.type)}
                                <h4 className={`text-lg font-semibold ${
                                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                }`}>
                                  {task.title}
                                </h4>
                              </div>
                              
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority} priority
                              </span>
                              
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                                {task.difficulty}
                              </span>
                            </div>
                            
                            <p className={`text-gray-600 mb-4 ${
                              task.completed ? 'line-through opacity-60' : ''
                            }`}>
                              {task.description}
                            </p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {task.duration}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">
                                {task.subject}
                              </span>
                              <span className="capitalize">
                                {task.type} activity
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
