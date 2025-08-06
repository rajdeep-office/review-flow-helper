import { PullRequest, Developer, Comment } from '@/types/pr';

export const developers: Developer[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@company.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@company.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: '3',
    name: 'Carol Chen',
    email: 'carol@company.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@company.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: '5',
    name: 'Eva Rodriguez',
    email: 'eva@company.com',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=150'
  }
];

const getRandomDeveloper = () => developers[Math.floor(Math.random() * developers.length)];

const sampleComments: Comment[] = [
  {
    id: 'c1',
    author: developers[1],
    content: 'Could you add more error handling in the authentication module?',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    resolved: false,
    replies: [
      {
        id: 'r1',
        author: developers[0],
        content: 'Sure, I will add proper error handling for all edge cases.',
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        resolved: false,
        replies: []
      }
    ]
  },
  {
    id: 'c2',
    author: developers[2],
    content: 'The API endpoint looks good, but please add unit tests.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    resolved: true,
    replies: []
  }
];

export const mockPullRequests: PullRequest[] = [
  {
    id: 'pr-1',
    title: 'Add user authentication system',
    description: 'Implement JWT-based authentication with refresh tokens and role-based access control.',
    author: developers[0],
    assignedReviewer: developers[1],
    status: 'reviewing',
    priority: 'high',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    daysWaiting: 3,
    branch: 'feature/auth-system',
    targetBranch: 'main',
    comments: sampleComments,
    filesChanged: 12,
    linesAdded: 450,
    linesDeleted: 23,
    automationEnabled: true,
    nextAction: 'Auto-merge if approved',
    nextActionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    hasConflicts: false,
    conflictFiles: [],
    githubPrNumber: 123,
    githubUrl: 'https://github.com/company/repo/pull/123',
    jiraTickets: ['AUTH-45', 'SEC-12'],
    labels: ['feature', 'security', 'high-priority']
  },
  {
    id: 'pr-2',
    title: 'Fix memory leak in data processing',
    description: 'Optimize memory usage in the batch processing module to prevent memory leaks.',
    author: developers[2],
    status: 'waiting',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    daysWaiting: 1,
    branch: 'bugfix/memory-leak',
    targetBranch: 'main',
    comments: [],
    filesChanged: 3,
    linesAdded: 67,
    linesDeleted: 89,
    automationEnabled: true,
    nextAction: 'Auto-assign reviewer',
    nextActionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    hasConflicts: true,
    conflictFiles: ['src/processor.ts', 'package.json'],
    githubPrNumber: 124,
    githubUrl: 'https://github.com/company/repo/pull/124',
    jiraTickets: ['BUG-89'],
    labels: ['bugfix', 'urgent', 'memory']
  },
  {
    id: 'pr-3',
    title: 'Update documentation for API v2',
    description: 'Comprehensive documentation update for the new API version with examples and migration guide.',
    author: developers[3],
    assignedReviewer: developers[4],
    status: 'commented',
    priority: 'medium',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    daysWaiting: 5,
    branch: 'docs/api-v2',
    targetBranch: 'main',
    comments: [
      {
        id: 'c3',
        author: developers[4],
        content: 'Please add more examples for the webhook endpoints.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        resolved: false,
        replies: []
      }
    ],
    filesChanged: 8,
    linesAdded: 234,
    linesDeleted: 12,
    automationEnabled: true,
    nextAction: 'Remind reviewer',
    nextActionDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
    hasConflicts: false,
    conflictFiles: [],
    githubPrNumber: 125,
    githubUrl: 'https://github.com/company/repo/pull/125',
    jiraTickets: ['DOC-23'],
    labels: ['documentation', 'api']
  },
  {
    id: 'pr-4',
    title: 'Implement dark mode theme',
    description: 'Add support for dark mode across all components with user preference persistence.',
    author: developers[1],
    status: 'approved',
    priority: 'medium',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    daysWaiting: 4,
    branch: 'feature/dark-mode',
    targetBranch: 'main',
    comments: [],
    filesChanged: 15,
    linesAdded: 520,
    linesDeleted: 45,
    automationEnabled: true,
    nextAction: 'Ready to merge',
    nextActionDate: new Date(Date.now() + 30 * 60 * 1000),
    hasConflicts: false,
    conflictFiles: [],
    githubPrNumber: 126,
    githubUrl: 'https://github.com/company/repo/pull/126',
    jiraTickets: ['UI-67'],
    labels: ['feature', 'ui', 'theme']
  },
  {
    id: 'pr-5',
    title: 'Refactor database connection pooling',
    description: 'Improve database performance by implementing connection pooling and query optimization.',
    author: developers[4],
    status: 'merged',
    priority: 'low',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    daysWaiting: 7,
    branch: 'perf/db-pooling',
    targetBranch: 'main',
    comments: [],
    filesChanged: 6,
    linesAdded: 156,
    linesDeleted: 234,
    automationEnabled: true,
    hasConflicts: false,
    conflictFiles: [],
    githubPrNumber: 127,
    githubUrl: 'https://github.com/company/repo/pull/127',
    jiraTickets: [],
    labels: ['performance', 'database']
  }
];