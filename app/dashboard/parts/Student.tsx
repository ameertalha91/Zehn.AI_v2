
'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Clock, BookOpen, Video, PenTool, FileText, Target, TrendingUp, Calendar } from 'lucide-react';
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

export default function Student() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    fetchStudyPlan();
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments?studentId=student-1');
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments.slice(0, 3)); // Show only recent 3
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

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
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container py-10">
        <div className="text-center text-gray-600">
          Failed to load study plan. Please try refreshing the page.
        </div>
      </div>
    );
  }

  const activeWeekData = plan.weeks.find(week => week.weekNumber === activeWeek);

  return (
    <div className="container py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Last updated: {new Date(plan.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Progress</p>
              <p className="text-3xl font-bold text-blue-600">{Math.round(plan.overallProgress)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Current Week</p>
              <p className="text-3xl font-bold text-green-600">{activeWeek}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">of {plan.totalWeeks} weeks</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Week Progress</p>
              <p className="text-3xl font-bold text-purple-600">
                {activeWeekData ? Math.round(activeWeekData.completionRate) : 0}%
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {activeWeekData?.theme || 'Select a week'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Study Hours</p>
              <p className="text-3xl font-bold text-orange-600">
                {activeWeekData?.totalHours || 0}h
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">this week</p>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Recent Assignments</h2>
            <Link 
              href="/student-assignments"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No assignments available</p>
              <p className="text-sm text-gray-500 mt-1">Check back later for new assignments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {assignment.submissionStatus ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.submissionStatus === 'GRADED' 
                          ? 'text-green-600 bg-green-100'
                          : assignment.submissionStatus === 'LATE'
                          ? 'text-red-600 bg-red-100' 
                          : 'text-blue-600 bg-blue-100'
                      }`}>
                        {assignment.submissionStatus}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                        PENDING
                      </span>
                    )}
                    <Link 
                      href="/student-assignments"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      {assignment.submissionStatus ? 'View' : 'Submit'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Study Plan */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{plan.title}</h2>
          <p className="text-gray-600 mt-2">{plan.description}</p>
        </div>

        {/* Week Navigation */}
        <div className="p-6 border-b">
          <div className="flex space-x-2 overflow-x-auto">
            {plan.weeks.map((week) => (
              <button
                key={week.weekNumber}
                onClick={() => setActiveWeek(week.weekNumber)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeWeek === week.weekNumber
                    ? 'bg-blue-600 text-white'
                    : week.completionRate === 100
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm">Week {week.weekNumber}</div>
                  <div className="text-xs opacity-75">{Math.round(week.completionRate)}%</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Week Content */}
        {activeWeekData && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Week {activeWeekData.weekNumber}: {activeWeekData.theme}
              </h3>
              <p className="text-gray-600">{activeWeekData.description}</p>
              
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {activeWeekData.totalHours} hours total
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-1" />
                  {activeWeekData.tasks.filter(task => task.completed).length}/{activeWeekData.tasks.length} completed
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
              {activeWeekData.tasks.map((task) => (
                <div 
                  key={task.id}
                  className={`border rounded-lg p-4 transition-all ${
                    task.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={() => toggleTaskCompletion(task.id, task.completed)}
                      className="mt-1 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {getTaskIcon(task.type)}
                          <h4 className={`font-medium ${
                            task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h4>
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                      </div>
                      
                      <p className={`text-sm mb-2 ${
                        task.completed ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {task.duration}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {task.subject}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Study Plan</h3>
          <p className="text-gray-600 mb-4">
            View your complete 6-week study plan with interactive task tracking and progress analytics.
          </p>
          <Link 
            href="/study-plan"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Study Plan
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">AI Research Assistant</h3>
          <p className="text-gray-600 mb-4">
            Ask questions about CSS syllabus topics and get exam-style examples with proper citations.
          </p>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Start Research Chat
          </button>
        </div>
      </div>
    </div>
  );
}
