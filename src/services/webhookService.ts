import { PullRequest } from "@/types/pr";
import { toast } from "@/hooks/use-toast";

export interface WebhookConfig {
  teamsWebhookUrl?: string;
  slackWebhookUrl?: string;
  enabled: boolean;
}

export class WebhookService {
  private static config: WebhookConfig = {
    enabled: false
  };

  static configure(config: WebhookConfig) {
    this.config = config;
  }

  static async sendTeamsNotification(message: string, pr: PullRequest, type: 'assignment' | 'conflict' | 'approved' | 'urgent') {
    if (!this.config.enabled || !this.config.teamsWebhookUrl) {
      console.log('Teams webhook not configured');
      return;
    }

    const color = this.getColorForType(type);
    const title = this.getTitleForType(type);

    const teamsMessage = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": color,
      "summary": `PR ${title}: ${pr.title}`,
      "sections": [{
        "activityTitle": title,
        "activitySubtitle": message,
        "activityImage": "https://github.com/favicon.ico",
        "facts": [
          {
            "name": "PR Title",
            "value": pr.title
          },
          {
            "name": "Author",
            "value": pr.author.name
          },
          {
            "name": "Branch",
            "value": `${pr.branch} → ${pr.targetBranch}`
          },
          {
            "name": "Priority",
            "value": pr.priority.toUpperCase()
          },
          ...(pr.assignedReviewer ? [{
            "name": "Reviewer",
            "value": pr.assignedReviewer.name
          }] : []),
          ...(pr.hasConflicts ? [{
            "name": "Conflicts",
            "value": `${pr.conflictFiles?.length || 0} files`
          }] : []),
          ...(pr.jiraTickets.length > 0 ? [{
            "name": "Jira Tickets",
            "value": pr.jiraTickets.join(', ')
          }] : [])
        ],
        "markdown": true
      }],
      "potentialAction": [
        {
          "@type": "OpenUri",
          "name": "View PR",
          "targets": [
            {
              "os": "default",
              "uri": pr.githubUrl || `#/pr/${pr.id}`
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(this.config.teamsWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamsMessage)
      });

      if (!response.ok) {
        throw new Error(`Teams webhook failed: ${response.status}`);
      }

      console.log('Teams notification sent successfully');
    } catch (error) {
      console.error('Failed to send Teams notification:', error);
      toast({
        title: "Webhook Error",
        description: "Failed to send Teams notification",
        variant: "destructive"
      });
    }
  }

  private static getColorForType(type: string): string {
    switch (type) {
      case 'urgent': return '#FF0000';
      case 'conflict': return '#FFA500';
      case 'approved': return '#00FF00';
      case 'assignment': return '#0078D4';
      default: return '#808080';
    }
  }

  private static getTitleForType(type: string): string {
    switch (type) {
      case 'urgent': return 'Urgent PR Alert';
      case 'conflict': return 'Merge Conflict Detected';
      case 'approved': return 'PR Approved';
      case 'assignment': return 'Reviewer Assigned';
      default: return 'PR Update';
    }
  }

  static async notifyReviewerAssigned(pr: PullRequest) {
    if (pr.assignedReviewer) {
      const message = `${pr.assignedReviewer.name} has been assigned to review "${pr.title}"`;
      await this.sendTeamsNotification(message, pr, 'assignment');
    }
  }

  static async notifyConflictDetected(pr: PullRequest) {
    const message = `Merge conflicts detected in "${pr.title}". ${pr.conflictFiles?.length || 0} files affected.`;
    await this.sendTeamsNotification(message, pr, 'conflict');
  }

  static async notifyUrgentPR(pr: PullRequest) {
    const message = `Urgent PR "${pr.title}" requires immediate attention!`;
    await this.sendTeamsNotification(message, pr, 'urgent');
  }

  static async notifyPRApproved(pr: PullRequest) {
    const message = `PR "${pr.title}" has been approved and is ready for merge.`;
    await this.sendTeamsNotification(message, pr, 'approved');
  }
}