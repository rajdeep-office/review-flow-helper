import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { GitHubService } from "@/services/githubService";
import { WebhookService } from "@/services/webhookService";
import { JiraService } from "@/services/jiraService";
import { ConflictDetectionService } from "@/services/conflictDetectionService";

interface IntegrationSettingsProps {
  onClose: () => void;
}

export const IntegrationSettings = ({ onClose }: IntegrationSettingsProps) => {
  const [githubToken, setGithubToken] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState("");
  const [webhooksEnabled, setWebhooksEnabled] = useState(false);
  
  const [jiraBaseUrl, setJiraBaseUrl] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [jiraProjectKey, setJiraProjectKey] = useState("");
  
  const [conflictDetectionEnabled, setConflictDetectionEnabled] = useState(true);
  const [conflictCheckInterval, setConflictCheckInterval] = useState(15);

  const handleGitHubSave = () => {
    if (!githubToken) {
      toast({
        title: "Missing Token",
        description: "Please provide a GitHub API token",
        variant: "destructive"
      });
      return;
    }

    GitHubService.setToken(githubToken);
    toast({
      title: "GitHub Connected",
      description: "GitHub integration has been configured successfully"
    });
  };

  const handleWebhookSave = () => {
    WebhookService.configure({
      teamsWebhookUrl,
      enabled: webhooksEnabled
    });

    toast({
      title: "Webhooks Configured",
      description: "Teams webhook integration has been updated"
    });
  };

  const handleJiraSave = () => {
    if (!jiraBaseUrl || !jiraEmail || !jiraToken) {
      toast({
        title: "Missing Configuration",
        description: "Please fill in all Jira configuration fields",
        variant: "destructive"
      });
      return;
    }

    JiraService.configure({
      baseUrl: jiraBaseUrl,
      email: jiraEmail,
      apiToken: jiraToken,
      projectKey: jiraProjectKey
    });

    toast({
      title: "Jira Connected",
      description: "Jira integration has been configured successfully"
    });
  };

  const handleConflictDetectionSave = () => {
    ConflictDetectionService.configure({
      enabled: conflictDetectionEnabled,
      checkInterval: conflictCheckInterval,
      autoNotify: true
    });

    toast({
      title: "Conflict Detection Updated",
      description: `Conflict monitoring ${conflictDetectionEnabled ? 'enabled' : 'disabled'}`
    });
  };

  const testGitHubConnection = async () => {
    if (!githubToken || !githubOwner || !githubRepo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all GitHub fields first",
        variant: "destructive"
      });
      return;
    }

    try {
      GitHubService.setToken(githubToken);
      const prs = await GitHubService.fetchPullRequests(githubOwner, githubRepo);
      toast({
        title: "Connection Successful",
        description: `Found ${prs.length} pull requests in ${githubOwner}/${githubRepo}`
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to GitHub. Please check your credentials.",
        variant: "destructive"
      });
    }
  };

  const testTeamsWebhook = async () => {
    if (!teamsWebhookUrl) {
      toast({
        title: "Missing URL",
        description: "Please provide a Teams webhook URL",
        variant: "destructive"
      });
      return;
    }

    try {
      await fetch(teamsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "@type": "MessageCard",
          "@context": "http://schema.org/extensions",
          "text": "🔧 Test notification from PR Dashboard - Integration is working!"
        })
      });

      toast({
        title: "Test Successful",
        description: "Teams webhook is working correctly"
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not send test message to Teams",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Integration Settings</h2>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <Tabs defaultValue="github" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="jira">Jira</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        </TabsList>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                GitHub Integration
                <Badge variant="secondary">API</Badge>
              </CardTitle>
              <CardDescription>
                Connect to GitHub to fetch real pull request data and sync status updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                <Input
                  id="github-token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Required scopes: repo, read:user
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github-owner">Repository Owner</Label>
                  <Input
                    id="github-owner"
                    placeholder="organization-name"
                    value={githubOwner}
                    onChange={(e) => setGithubOwner(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github-repo">Repository Name</Label>
                  <Input
                    id="github-repo"
                    placeholder="repository-name"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGitHubSave}>Save GitHub Config</Button>
                <Button variant="outline" onClick={testGitHubConnection}>
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Teams Webhook Integration
                <Badge variant="secondary">Notifications</Badge>
              </CardTitle>
              <CardDescription>
                Send automated notifications to Microsoft Teams channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="webhooks-enabled"
                  checked={webhooksEnabled}
                  onCheckedChange={setWebhooksEnabled}
                />
                <Label htmlFor="webhooks-enabled">Enable Teams notifications</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teams-webhook">Teams Webhook URL</Label>
                <Input
                  id="teams-webhook"
                  placeholder="https://company.webhook.office.com/..."
                  value={teamsWebhookUrl}
                  onChange={(e) => setTeamsWebhookUrl(e.target.value)}
                  disabled={!webhooksEnabled}
                />
                <p className="text-sm text-muted-foreground">
                  Get this URL from your Teams channel connector settings
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleWebhookSave} disabled={!webhooksEnabled}>
                  Save Webhook Config
                </Button>
                <Button
                  variant="outline"
                  onClick={testTeamsWebhook}
                  disabled={!webhooksEnabled || !teamsWebhookUrl}
                >
                  Send Test Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jira">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Jira Integration
                <Badge variant="secondary">Ticketing</Badge>
              </CardTitle>
              <CardDescription>
                Link pull requests to Jira tickets and sync status updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jira-url">Jira Base URL</Label>
                <Input
                  id="jira-url"
                  placeholder="https://company.atlassian.net"
                  value={jiraBaseUrl}
                  onChange={(e) => setJiraBaseUrl(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jira-email">Jira Email</Label>
                  <Input
                    id="jira-email"
                    type="email"
                    placeholder="user@company.com"
                    value={jiraEmail}
                    onChange={(e) => setJiraEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jira-token">API Token</Label>
                  <Input
                    id="jira-token"
                    type="password"
                    placeholder="API token from Jira"
                    value={jiraToken}
                    onChange={(e) => setJiraToken(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jira-project">Project Key (Optional)</Label>
                <Input
                  id="jira-project"
                  placeholder="PROJ"
                  value={jiraProjectKey}
                  onChange={(e) => setJiraProjectKey(e.target.value.toUpperCase())}
                />
                <p className="text-sm text-muted-foreground">
                  Used for creating new tickets. Leave empty to only link existing tickets.
                </p>
              </div>

              <Button onClick={handleJiraSave}>Save Jira Config</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Conflict Detection
                <Badge variant="secondary">Automation</Badge>
              </CardTitle>
              <CardDescription>
                Automatically detect and alert on merge conflicts in pull requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="conflict-detection"
                  checked={conflictDetectionEnabled}
                  onCheckedChange={setConflictDetectionEnabled}
                />
                <Label htmlFor="conflict-detection">Enable automatic conflict detection</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="check-interval">Check Interval (minutes)</Label>
                <Input
                  id="check-interval"
                  type="number"
                  min="5"
                  max="60"
                  value={conflictCheckInterval}
                  onChange={(e) => setConflictCheckInterval(parseInt(e.target.value) || 15)}
                  disabled={!conflictDetectionEnabled}
                />
                <p className="text-sm text-muted-foreground">
                  How often to check for new conflicts (5-60 minutes)
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Detection Features:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Automatic conflict scanning</li>
                  <li>• Real-time notifications</li>
                  <li>• Teams webhook alerts</li>
                  <li>• Conflict file identification</li>
                </ul>
              </div>

              <Button onClick={handleConflictDetectionSave}>Save Detection Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};