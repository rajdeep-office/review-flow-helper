export interface Developer {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Comment {
  id: string;
  author: Developer;
  content: string;
  timestamp: Date;
  resolved: boolean;
  replies?: Comment[];
}

export interface PullRequest {
  id: string;
  title: string;
  description: string;
  author: Developer;
  assignedReviewer?: Developer;
  status: 'waiting' | 'assigned' | 'reviewing' | 'commented' | 'approved' | 'merged';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  daysWaiting: number;
  branch: string;
  targetBranch: string;
  comments: Comment[];
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  automationEnabled: boolean;
  nextAction?: string;
  nextActionDate?: Date;
  hasConflicts: boolean;
  conflictFiles?: string[];
  githubPrNumber?: number;
  githubUrl?: string;
  jiraTickets: string[];
  labels: string[];
}

export interface AutomationSettings {
  waitDays: number;
  autoAssign: boolean;
  autoReview: boolean;
  autoMerge: boolean;
  reminderInterval: number;
  excludedAuthors: string[];
  reviewerPool: string[];
}