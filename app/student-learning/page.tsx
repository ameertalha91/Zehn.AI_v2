"use client";

import VideoQuizComponent from '../../components/VideoQuizComponent';

export default function StudentLearningPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CSS Exam Preparation | Pakistan Affairs</h1>
      {/* Add a key to force re-rendering */}
      <VideoQuizComponent key="video-component" />
    </div>
  );
}