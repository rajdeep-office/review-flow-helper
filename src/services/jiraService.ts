import { toast } from "@/hooks/use-toast";

export interface JiraTicket {
  key: string;
  summary: string;
  status: string;
  priority: string;
  assignee?: string;
  url: string;
}

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey?: string;
}

export class JiraService {
  private static config: JiraConfig | null = null;

  static configure(config: JiraConfig) {
    this.config = config;
  }

  static async getTicketInfo(ticketKey: string): Promise<JiraTicket | null> {
    if (!this.config) {
      console.log('Jira not configured');
      return null;
    }

    try {
      const auth = btoa(`${this.config.email}:${this.config.apiToken}`);
      
      const response = await fetch(`${this.config.baseUrl}/rest/api/3/issue/${ticketKey}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status}`);
      }

      const issue = await response.json();
      
      return {
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name || 'Medium',
        assignee: issue.fields.assignee?.displayName,
        url: `${this.config.baseUrl}/browse/${issue.key}`
      };
    } catch (error) {
      console.error(`Failed to fetch Jira ticket ${ticketKey}:`, error);
      return null;
    }
  }

  static async getMultipleTickets(ticketKeys: string[]): Promise<JiraTicket[]> {
    if (!ticketKeys.length || !this.config) {
      return [];
    }

    const tickets = await Promise.all(
      ticketKeys.map(key => this.getTicketInfo(key))
    );

    return tickets.filter((ticket): ticket is JiraTicket => ticket !== null);
  }

  static extractTicketKeys(text: string): string[] {
    const jiraRegex = /([A-Z]+-\d+)/g;
    const matches = text.match(jiraRegex);
    return matches ? [...new Set(matches)] : [];
  }

  static async createTicketLink(prTitle: string, prDescription: string, prUrl: string): Promise<string | null> {
    if (!this.config || !this.config.projectKey) {
      toast({
        title: "Jira Not Configured",
        description: "Jira project configuration is required to create tickets",
        variant: "destructive"
      });
      return null;
    }

    try {
      const auth = btoa(`${this.config.email}:${this.config.apiToken}`);
      
      const ticketData = {
        fields: {
          project: {
            key: this.config.projectKey
          },
          summary: `PR Review: ${prTitle}`,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: `Pull Request: ${prTitle}\n\n${prDescription}\n\nPR Link: ${prUrl}`
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: "Task"
          }
        }
      };

      const response = await fetch(`${this.config.baseUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData)
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: "Jira Ticket Created",
        description: `Created ticket ${result.key} for PR review`,
      });

      return result.key;
    } catch (error) {
      console.error('Failed to create Jira ticket:', error);
      toast({
        title: "Failed to Create Jira Ticket",
        description: "Could not create Jira ticket for this PR",
        variant: "destructive"
      });
      return null;
    }
  }

  static async updateTicketStatus(ticketKey: string, transitionId: string): Promise<boolean> {
    if (!this.config) {
      return false;
    }

    try {
      const auth = btoa(`${this.config.email}:${this.config.apiToken}`);
      
      const response = await fetch(`${this.config.baseUrl}/rest/api/3/issue/${ticketKey}/transitions`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transition: {
            id: transitionId
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to update Jira ticket ${ticketKey}:`, error);
      return false;
    }
  }

  static getTicketUrl(ticketKey: string): string {
    return this.config ? `${this.config.baseUrl}/browse/${ticketKey}` : '';
  }

  static isConfigured(): boolean {
    return this.config !== null;
  }
}