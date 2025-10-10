/**
 * CSS PAKISTAN AFFAIRS SYLLABUS
 * 
 * This module defines the official CSS Pakistan Affairs syllabus structure.
 * Topics are organized hierarchically for easy integration with study plans
 * and course content.
 * 
 * INTEGRATION POINTS:
 * - Study plans will use these topics to generate weekly learning objectives
 * - Courses can be mapped to specific syllabus topics
 * - Progress tracking will be based on topic completion
 */

export interface SyllabusTopic {
  id: string;
  title: string;
  description?: string;
  subtopics?: SyllabusTopic[];
  estimatedHours?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SubjectSyllabus {
  subjectId: string;
  subjectName: string;
  totalMarks: number;
  paperType: 'compulsory' | 'optional';
  topics: SyllabusTopic[];
}

// CSS Pakistan Affairs Official Syllabus Structure
export const pakistanAffairsSyllabus: SubjectSyllabus = {
  subjectId: 'pakistan-affairs',
  subjectName: 'Pakistan Affairs',
  totalMarks: 100,
  paperType: 'compulsory',
  topics: [
    {
      id: 'pa-1',
      title: 'Evolution of Muslim Society in the Subcontinent',
      priority: 'high',
      estimatedHours: 10,
      subtopics: [
        {
          id: 'pa-1.1',
          title: 'Arrival of Muslims in the Subcontinent',
          priority: 'medium',
          estimatedHours: 2
        },
        {
          id: 'pa-1.2',
          title: 'Foundation of Muslim Rule',
          priority: 'medium',
          estimatedHours: 2
        },
        {
          id: 'pa-1.3',
          title: 'Downfall of Muslim Rule and British Colonialism',
          priority: 'high',
          estimatedHours: 3
        },
        {
          id: 'pa-1.4',
          title: 'Muslim Renaissance and Reform Movements',
          priority: 'high',
          estimatedHours: 3
        }
      ]
    },
    {
      id: 'pa-2',
      title: 'Ideology of Pakistan',
      priority: 'high',
      estimatedHours: 8,
      subtopics: [
        {
          id: 'pa-2.1',
          title: 'Definition and Significance of Ideology',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-2.2',
          title: 'Two Nation Theory',
          priority: 'high',
          estimatedHours: 3
        },
        {
          id: 'pa-2.3',
          title: 'Ideology of Pakistan through Quaid-e-Azam and Allama Iqbal',
          priority: 'high',
          estimatedHours: 3
        }
      ]
    },
    {
      id: 'pa-3',
      title: 'Pakistan Movement',
      priority: 'high',
      estimatedHours: 12,
      subtopics: [
        {
          id: 'pa-3.1',
          title: 'Political Developments 1857-1947',
          priority: 'high',
          estimatedHours: 3
        },
        {
          id: 'pa-3.2',
          title: 'Formation of Muslim League',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-3.3',
          title: 'Lucknow Pact and Khilafat Movement',
          priority: 'medium',
          estimatedHours: 2
        },
        {
          id: 'pa-3.4',
          title: 'Constitutional Developments 1909-1935',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-3.5',
          title: 'Pakistan Resolution to Independence 1940-1947',
          priority: 'high',
          estimatedHours: 3
        }
      ]
    },
    {
      id: 'pa-4',
      title: 'Constitutional Development in Pakistan',
      priority: 'high',
      estimatedHours: 10,
      subtopics: [
        {
          id: 'pa-4.1',
          title: 'Early Constitutional Efforts (1947-1956)',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-4.2',
          title: 'Constitution of 1956',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-4.3',
          title: 'Constitution of 1962',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-4.4',
          title: 'Constitution of 1973',
          priority: 'high',
          estimatedHours: 3
        },
        {
          id: 'pa-4.5',
          title: 'Constitutional Amendments and Current Issues',
          priority: 'medium',
          estimatedHours: 1
        }
      ]
    },
    {
      id: 'pa-5',
      title: 'Contemporary Pakistan',
      priority: 'high',
      estimatedHours: 15,
      subtopics: [
        {
          id: 'pa-5.1',
          title: 'Political Development Since 1971',
          priority: 'high',
          estimatedHours: 3
        },
        {
          id: 'pa-5.2',
          title: 'Civil-Military Relations',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-5.3',
          title: 'Judicial System and Rule of Law',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-5.4',
          title: 'Federal Structure and Provincial Autonomy',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-5.5',
          title: 'Political Parties and Electoral Process',
          priority: 'medium',
          estimatedHours: 2
        },
        {
          id: 'pa-5.6',
          title: 'Civil Society and Media',
          priority: 'medium',
          estimatedHours: 2
        },
        {
          id: 'pa-5.7',
          title: 'Human Rights and Gender Issues',
          priority: 'medium',
          estimatedHours: 2
        }
      ]
    },
    {
      id: 'pa-6',
      title: 'Economic Development and Planning',
      priority: 'high',
      estimatedHours: 10,
      subtopics: [
        {
          id: 'pa-6.1',
          title: 'Economic Policies and Five Year Plans',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-6.2',
          title: 'Agricultural and Industrial Development',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-6.3',
          title: 'Trade, Commerce and CPEC',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-6.4',
          title: 'Poverty Alleviation and Social Sector Development',
          priority: 'medium',
          estimatedHours: 2
        },
        {
          id: 'pa-6.5',
          title: 'Energy Crisis and Environmental Issues',
          priority: 'high',
          estimatedHours: 2
        }
      ]
    },
    {
      id: 'pa-7',
      title: 'Foreign Policy of Pakistan',
      priority: 'high',
      estimatedHours: 12,
      subtopics: [
        {
          id: 'pa-7.1',
          title: 'Foundations and Objectives of Foreign Policy',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-7.2',
          title: 'Relations with India',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-7.3',
          title: 'Relations with China',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-7.4',
          title: 'Relations with USA',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-7.5',
          title: 'Relations with Muslim World',
          priority: 'medium',
          estimatedHours: 2
        },
        {
          id: 'pa-7.6',
          title: 'Pakistan and International Organizations',
          priority: 'medium',
          estimatedHours: 2
        }
      ]
    },
    {
      id: 'pa-8',
      title: 'Social and Cultural Development',
      priority: 'medium',
      estimatedHours: 8,
      subtopics: [
        {
          id: 'pa-8.1',
          title: 'Education System and Reforms',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-8.2',
          title: 'National Integration and Ethnic Diversity',
          priority: 'high',
          estimatedHours: 2
        },
        {
          id: 'pa-8.3',
          title: 'Urdu as National Language',
          priority: 'medium',
          estimatedHours: 2
        },
        {
          id: 'pa-8.4',
          title: 'Cultural Heritage and Tourism',
          priority: 'low',
          estimatedHours: 2
        }
      ]
    }
  ]
};

// Helper function to get all topics flattened
export function getAllTopicsFlat(syllabus: SubjectSyllabus): SyllabusTopic[] {
  const topics: SyllabusTopic[] = [];
  
  function addTopics(topicList: SyllabusTopic[]) {
    topicList.forEach(topic => {
      topics.push(topic);
      if (topic.subtopics) {
        addTopics(topic.subtopics);
      }
    });
  }
  
  addTopics(syllabus.topics);
  return topics;
}

// Helper function to get topics by priority
export function getTopicsByPriority(syllabus: SubjectSyllabus, priority: 'high' | 'medium' | 'low'): SyllabusTopic[] {
  return getAllTopicsFlat(syllabus).filter(topic => topic.priority === priority);
}

// Helper function to calculate total study hours
export function getTotalStudyHours(syllabus: SubjectSyllabus): number {
  return syllabus.topics.reduce((total, topic) => total + (topic.estimatedHours || 0), 0);
}

