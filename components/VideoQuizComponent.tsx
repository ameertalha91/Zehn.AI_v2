"use client";

import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, Volume2, VolumeX, Clock, Brain, CheckCircle, XCircle, SkipForward } from 'lucide-react';

const VideoQuizComponent = ({ videoId = 'vxCnkM48zPY' }: { videoId?: string }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [lastQuizTime, setLastQuizTime] = useState(0);
  const [quizError, setQuizError] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [extractedKeywords, setExtractedKeywords] = useState([]);

  // YouTube video URL - use the passed videoId
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const onReady = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    
    // Get video title and extract keywords
    const title = event.target.getVideoData().title;
    setVideoTitle(title);
    const keywords = extractKeywordsFromTitle(title);
    setExtractedKeywords(keywords);
    console.log('Video title:', title);
    console.log('Extracted keywords:', keywords);
  };

  const onStateChange = (event) => {
    setIsPlaying(event.data === 1);
    setCurrentTime(event.target.getCurrentTime());
  };

  // YouTube options
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
    },
  };

  // Check if transcript exists on component mount
  useEffect(() => {
    const checkTranscript = async () => {
      try {
        const response = await fetch(`/api/transcript/${videoId}`);
        const data = await response.json();
        
        if (!response.ok) {
          console.warn('Transcript not found for video:', videoId);
          console.log('Transcript check response:', data);
        } else {
          console.log('Transcript available:', data);
        }
      } catch (error) {
        console.error('Error checking transcript:', error);
      }
    };
    
    checkTranscript();
  }, []);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(async () => {
      const current = player.getCurrentTime();
      setCurrentTime(current);
      
      // Check every 5 minutes (300 seconds) - fix the logic
      const currentInterval = Math.floor(current / 300);
      const lastInterval = Math.floor(lastQuizTime / 300);
      
      if (currentInterval > lastInterval && currentInterval > 0 && !showQuiz) {
        console.log('Quiz condition met! Triggering quiz at interval:', currentInterval);
        player.pauseVideo();
        await triggerQuiz(current);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, lastQuizTime, showQuiz]);

  const extractKeywordsFromTitle = (title) => {
    // Remove common stop words and extract meaningful keywords
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'part', 'episode', 'lecture', 'class'];
    
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5); // Take first 5 meaningful words
  };

  const triggerQuiz = async (currentVideoTime) => {
    console.log('Triggering quiz at time:', currentVideoTime);
    console.log('Video ID being sent:', videoId);
    
    setIsPlaying(false);
    setIsLoadingQuiz(true);
    setShowQuiz(true);
    setQuizError(null);

    try {
      // Use extracted keywords from video title
      const keywords = extractedKeywords.length > 0 ? extractedKeywords : ["Pakistan", "Studies"];
      console.log('Using keywords:', keywords);
      
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoTime: Math.floor(currentVideoTime / 60),
          keywords: keywords,
          videoTitle: videoTitle
        })
      });
      
      const data = await response.json();
      console.log('Quiz API response:', data);
      
      if (!response.ok) {
        // Handle specific error types
        if (data.needsTranscript) {
          throw new Error('Transcript not available. Please ensure the video has been processed.');
        } else if (data.needsMoreContent) {
          throw new Error('Not enough content available yet. Please continue watching.');
        } else {
          throw new Error(data.error || 'Failed to generate quiz');
        }
      }
      
      if (data.success && data.questions) {
        console.log('Quiz generated successfully with', data.questions.length, 'questions');
        setQuizData(data);
        setSelectedAnswers({});
        setQuizResults(null);
        setLastQuizTime(currentVideoTime);
      } else {
        throw new Error('Invalid quiz data received');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setQuizError(error.message);
      
      // Auto-close after showing error
      setTimeout(() => {
        setShowQuiz(false);
        setQuizError(null);
        player?.playVideo();
      }, 5000);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      player?.pauseVideo();
    } else {
      player?.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    if (player) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      player.seekTo(pos * duration);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const submitQuiz = () => {
    const results = quizData.questions.map(q => ({
      questionId: q.id,
      correct: selectedAnswers[q.id] === q.correct,
      selectedAnswer: selectedAnswers[q.id],
      correctAnswer: q.correct
    }));
    
    const score = results.filter(r => r.correct).length;
    const quizResult = {
      timeStamp: quizData.timeStamp,
      score: score,
      total: quizData.questions.length,
      results: results
    };
    
    setQuizResults(quizResult);
    setQuizHistory(prev => [...prev, quizResult]);
  };

  const closeQuiz = () => {
    setShowQuiz(false);
    setQuizData(null);
    setQuizResults(null);
    setQuizError(null);
  };

  const continueVideo = () => {
    closeQuiz();
    setIsPlaying(true);
    player?.playVideo();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Manual quiz trigger button for testing
  const manualTriggerQuiz = () => {
    if (player) {
      const current = player.getCurrentTime();
      player.pauseVideo();
      triggerQuiz(current);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Interactive Learning Session</h1>
        <p className="text-gray-600">Watch the video and test your knowledge with automatic quizzes every 5 minutes</p>
        {videoTitle && (
          <p className="text-sm text-gray-500 mt-2">Video: {videoTitle}</p>
        )}
        {extractedKeywords.length > 0 && (
          <p className="text-sm text-blue-600 mt-1">Keywords: {extractedKeywords.join(', ')}</p>
        )}
        
        {/* Debug button for testing */}
        <button
          onClick={manualTriggerQuiz}
          className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
        >
          Test Quiz Now (Debug)
        </button>
      </div>

      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-6">
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          onReady={onReady}
          onStateChange={onStateChange}
        />
        
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button
              onClick={toggleMute}
              className="text-white hover:text-blue-300 transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <div className="flex-1">
              <div 
                className="bg-gray-600 h-1 rounded-full cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Quiz History */}
      {quizHistory.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Clock className="mr-2" size={20} />
            Quiz Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quizHistory.map((quiz, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quiz {index + 1}</span>
                  <span className="text-xs text-gray-500">{quiz.timeStamp}min</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {quiz.score}/{quiz.total}
                </div>
                <div className="text-xs text-gray-600">
                  {Math.round((quiz.score / quiz.total) * 100)}% correct
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {isLoadingQuiz ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating quiz questions...</p>
              </div>
            ) : quizError ? (
              <div className="text-center py-8">
                <XCircle className="text-red-500 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-semibold text-red-600 mb-2">Quiz Generation Failed</h3>
                <p className="text-gray-600 mb-4">{quizError}</p>
                <p className="text-sm text-gray-500">Continuing video in 5 seconds...</p>
              </div>
            ) : quizData && !quizResults ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Brain className="mr-3 text-blue-600" size={24} />
                    Quick Knowledge Check
                  </h2>
                  <span className="text-sm text-gray-500">
                    Video time: {quizData.timeStamp} minutes
                  </span>
                </div>

                <div className="space-y-6">
                  {quizData.questions.map((question, qIndex) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">
                        {qIndex + 1}. {question.question}
                      </h3>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <label 
                            key={oIndex}
                            className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={oIndex}
                              checked={selectedAnswers[question.id] === oIndex}
                              onChange={() => handleAnswerSelect(question.id, oIndex)}
                              className="mr-3"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={closeQuiz}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Skip Quiz
                  </button>
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(selectedAnswers).length < quizData.questions.length}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            ) : quizResults && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {quizResults.score}/{quizResults.total}
                  </div>
                  <p className="text-gray-600">
                    You scored {Math.round((quizResults.score / quizResults.total) * 100)}%
                  </p>
                </div>

                <div className="space-y-4">
                  {quizData.questions.map((question, index) => {
                    const result = quizResults.results[index];
                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{question.question}</h4>
                          {result.correct ? (
                            <CheckCircle className="text-green-500" size={20} />
                          ) : (
                            <XCircle className="text-red-500" size={20} />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Your answer: {question.options[result.selectedAnswer]}</p>
                          {!result.correct && (
                            <p className="text-green-600 mt-1">
                              Correct answer: {question.options[result.correctAnswer]}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={continueVideo}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <SkipForward className="mr-2" size={16} />
                    Continue Video
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoQuizComponent;