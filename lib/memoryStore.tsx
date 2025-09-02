// In-memory data store to replace database dependency

interface Video {
  id: string;
  youtubeId: string;
  title: string;
  keywords: string[];
}

interface Quiz {
  id: string;
  videoId: string;
  questions: any[];
  timeMarker: number;
}

interface SampleQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  keywords: string[];
  category: string;
}

// In-memory storage
const store = {
  videos: [] as Video[],
  quizzes: [] as Quiz[],
  sampleQuestions: [] as SampleQuestion[]
};

// Helper methods to mimic Prisma client
export const memoryDb = {
  video: {
    create: async (data: { data: Omit<Video, 'id'> }) => {
      const video = {
        id: `video_${Date.now()}`,
        ...data.data
      };
      store.videos.push(video);
      return video;
    },
    findUnique: async (args: { where: { id?: string; youtubeId?: string } }) => {
      if (args.where.id) {
        return store.videos.find(v => v.id === args.where.id) || null;
      }
      if (args.where.youtubeId) {
        return store.videos.find(v => v.youtubeId === args.where.youtubeId) || null;
      }
      return null;
    },
    findMany: async () => {
      return [...store.videos];
    }
  },
  quiz: {
    create: async (data: { data: Omit<Quiz, 'id'> }) => {
      const quiz = {
        id: `quiz_${Date.now()}`,
        ...data.data
      };
      store.quizzes.push(quiz);
      return quiz;
    },
    findFirst: async (args: { where: any; orderBy?: any }) => {
      // Simple implementation for the findFirst method
      return store.quizzes.find(q => q.videoId === args.where.videoId) || null;
    }
  },
  sampleQuestion: {
    create: async (data: { data: Omit<SampleQuestion, 'id'> }) => {
      const question = {
        id: `question_${Date.now()}`,
        ...data.data
      };
      store.sampleQuestions.push(question);
      return question;
    },
    findMany: async (args: { where?: any; take?: number }) => {
      let result = [...store.sampleQuestions];
      
      // Simple keyword filtering
      if (args.where?.keywords?.hasSome) {
        const keywords = args.where.keywords.hasSome;
        result = result.filter(q => 
          q.keywords.some(k => keywords.includes(k))
        );
      }
      
      if (args.take) {
        result = result.slice(0, args.take);
      }
      
      return result;
    }
  }
};
