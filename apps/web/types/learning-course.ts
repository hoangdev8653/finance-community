export interface LearningCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  domainId: string;
  learningOutcomes: string[];
  heroMediaId: string | null;
  heroAltText: string | null;
  heroImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  isPublished?: boolean;
}
export interface LearningPathDetail { series: LearningCourse; lessons: Array<{ id: string; title: string; slug: string; lessonOrder: number; isRequired: boolean }>; }
export interface LearningPathProgress { seriesId: string; completedCount: number; totalCount: number; requiredCompletedCount: number; requiredCount: number; percentage: number; nextLesson: { id: string; title: string; slug: string; lessonOrder: number } | null; lessons: Array<{ id: string; completed: boolean; locked: boolean }>; }
