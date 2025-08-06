import { PullRequest, Developer } from "@/types/pr";

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  draft: boolean;
  user: {
    login: string;
    avatar_url: string;
  };
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
  mergeable: boolean | null;
  mergeable_state: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  comments: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export class GitHubService {
  private static apiToken: string | null = null;
  private static baseUrl = 'https://api.github.com';

  static setToken(token: string) {
    this.apiToken = token;
  }

  static async fetchPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
    if (!this.apiToken) {
      throw new Error('GitHub API token not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const githubPRs: GitHubPR[] = await response.json();
      return githubPRs.map(this.convertGitHubPRToLocal);
    } catch (error) {
      console.error('Failed to fetch GitHub PRs:', error);
      throw error;
    }
  }

  static async checkConflicts(owner: string, repo: string, prNumber: number): Promise<{
    hasConflicts: boolean;
    conflictFiles: string[];
  }> {
    if (!this.apiToken) {
      return { hasConflicts: false, conflictFiles: [] };
    }

    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const pr: GitHubPR = await response.json();
      const hasConflicts = pr.mergeable === false && pr.mergeable_state === 'dirty';

      // If there are conflicts, fetch the files to get conflict details
      let conflictFiles: string[] = [];
      if (hasConflicts) {
        const filesResponse = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (filesResponse.ok) {
          const files = await filesResponse.json();
          conflictFiles = files
            .filter((file: any) => file.status === 'modified')
            .map((file: any) => file.filename);
        }
      }

      return { hasConflicts, conflictFiles };
    } catch (error) {
      console.error('Failed to check conflicts:', error);
      return { hasConflicts: false, conflictFiles: [] };
    }
  }

  private static convertGitHubPRToLocal(githubPR: GitHubPR): PullRequest {
    const priority = this.determinePriority(githubPR);
    const status = this.determineStatus(githubPR);
    const jiraTickets = this.extractJiraTickets(githubPR.title + ' ' + githubPR.body);

    return {
      id: `github-${githubPR.id}`,
      title: githubPR.title,
      description: githubPR.body || '',
      author: {
        id: githubPR.user.login,
        name: githubPR.user.login,
        email: `${githubPR.user.login}@github.local`,
        avatar: githubPR.user.avatar_url,
      },
      assignedReviewer: githubPR.assignees.length > 0 ? {
        id: githubPR.assignees[0].login,
        name: githubPR.assignees[0].login,
        email: `${githubPR.assignees[0].login}@github.local`,
        avatar: githubPR.assignees[0].avatar_url,
      } : undefined,
      status,
      priority,
      createdAt: new Date(githubPR.created_at),
      updatedAt: new Date(githubPR.updated_at),
      daysWaiting: Math.floor((Date.now() - new Date(githubPR.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      branch: githubPR.head.ref,
      targetBranch: githubPR.base.ref,
      comments: [],
      filesChanged: githubPR.changed_files,
      linesAdded: githubPR.additions,
      linesDeleted: githubPR.deletions,
      automationEnabled: true,
      hasConflicts: githubPR.mergeable === false,
      conflictFiles: [],
      githubPrNumber: githubPR.number,
      githubUrl: githubPR.html_url,
      jiraTickets,
      labels: githubPR.labels.map(label => label.name),
    };
  }

  private static determinePriority(githubPR: GitHubPR): 'low' | 'medium' | 'high' | 'urgent' {
    const labels = githubPR.labels.map(l => l.name.toLowerCase());
    
    if (labels.some(l => l.includes('urgent') || l.includes('critical') || l.includes('hotfix'))) {
      return 'urgent';
    }
    if (labels.some(l => l.includes('high'))) {
      return 'high';
    }
    if (labels.some(l => l.includes('low'))) {
      return 'low';
    }
    return 'medium';
  }

  private static determineStatus(githubPR: GitHubPR): PullRequest['status'] {
    if (githubPR.draft) return 'waiting';
    if (githubPR.assignees.length > 0) return 'assigned';
    if (githubPR.comments > 0) return 'commented';
    return 'waiting';
  }

  private static extractJiraTickets(text: string): string[] {
    const jiraRegex = /([A-Z]+-\d+)/g;
    const matches = text.match(jiraRegex);
    return matches ? [...new Set(matches)] : [];
  }
}