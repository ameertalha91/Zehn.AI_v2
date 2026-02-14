/**
 * In-memory store for process-video API (video + quiz creation).
 * Used when processing videos before persisting to DB.
 */

const videos: { id: string; youtubeId: string; title: string; keywords: string | string[] }[] = [];
const quizzes: { id: string; videoId: string; questions: unknown; timeMarker: number }[] = [];

export const memoryDb = {
  video: {
    create: async ({ data }: { data: { youtubeId: string; title: string; keywords: string | string[] } }) => {
      const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      videos.push({ id, ...data });
      return { id, ...data };
    }
  },
  quiz: {
    create: async ({ data }: { data: { videoId: string; questions: unknown; timeMarker: number } }) => {
      const id = `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      quizzes.push({ id, ...data });
      return { id, ...data };
    }
  }
};
