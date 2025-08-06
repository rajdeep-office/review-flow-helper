import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRCard } from "./PRCard";
import { PRDetails } from "./PRDetails";
import { AutomationSettings } from "./AutomationSettings";
import { SearchFilter, FilterState } from "./SearchFilter";
import { IntegrationSettings } from "./IntegrationSettings";
import { mockPullRequests, developers } from "@/data/mockData";
import { PullRequest } from "@/types/pr";
import { Clock, CheckCircle, AlertCircle, GitPullRequest, Settings, AlertTriangle, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConflictDetectionService } from "@/services/conflictDetectionService";
import { WebhookService } from "@/services/webhookService";

export const PRDashboard = () => {
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(mockPullRequests);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: [],
    status: [],
    author: [],
    hasConflicts: null,
    withJira: null
  });

  const filteredPRs = applyFilters(pullRequests, filters);
  
  const stats = {
    total: filteredPRs.length,
    waiting: filteredPRs.filter(pr => pr.status === 'waiting').length,
    reviewing: filteredPRs.filter(pr => pr.status === 'reviewing' || pr.status === 'assigned').length,
    commented: filteredPRs.filter(pr => pr.status === 'commented').length,
    approved: filteredPRs.filter(pr => pr.status === 'approved').length,
    merged: filteredPRs.filter(pr => pr.status === 'merged').length,
    conflicts: filteredPRs.filter(pr => pr.hasConflicts).length,
    urgent: filteredPRs.filter(pr => pr.priority === 'urgent').length,
    withJira: filteredPRs.filter(pr => pr.jiraTickets.length > 0).length,
  };

  const conflictSummary = ConflictDetectionService.getConflictSummary(pullRequests);

  useEffect(() => {
    // Initialize services
    ConflictDetectionService.configure({
      enabled: true,
      checkInterval: 15,
      autoNotify: true
    });

    // Check for urgent PRs and send notifications
    const urgentPRs = pullRequests.filter(pr => pr.priority === 'urgent' && pr.status !== 'merged');
    urgentPRs.forEach(pr => {
      WebhookService.notifyUrgentPR(pr);
    });
  }, [pullRequests]);

  const filterPRs = (status?: string) => {
    if (!status) return filteredPRs;
    if (status === 'active') return filteredPRs.filter(pr => !['merged'].includes(pr.status));
    return filteredPRs.filter(pr => pr.status === status);
  };

  function applyFilters(prs: PullRequest[], filters: FilterState): PullRequest[] {
    return prs.filter(pr => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          pr.title.toLowerCase().includes(searchTerm) ||
          pr.description.toLowerCase().includes(searchTerm) ||
          pr.branch.toLowerCase().includes(searchTerm) ||
          pr.author.name.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(pr.priority)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(pr.status)) {
        return false;
      }

      // Author filter
      if (filters.author.length > 0 && !filters.author.includes(pr.author.name)) {
        return false;
      }

      // Conflicts filter
      if (filters.hasConflicts === true && !pr.hasConflicts) {
        return false;
      }

      // Jira filter
      if (filters.withJira === true && pr.jiraTickets.length === 0) {
        return false;
      }

      return true;
    });
  }

  if (selectedPR) {
    return (
      <PRDetails 
        pr={selectedPR} 
        onBack={() => setSelectedPR(null)}
        onUpdate={(updatedPR) => setSelectedPR(updatedPR)}
      />
    );
  }

  if (showSettings) {
    return (
      <AutomationSettings onBack={() => setShowSettings(false)} />
    );
  }

  if (showIntegrations) {
    return (
      <IntegrationSettings onClose={() => setShowIntegrations(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">PR Automation Dashboard</h1>
            <p className="text-muted-foreground">Streamline your code review process with intelligent automation</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowIntegrations(true)} variant="outline">
              <Link className="h-4 w-4 mr-2" />
              Integrations
            </Button>
            <Button onClick={() => setShowSettings(true)} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFilter
          filters={filters}
          onFiltersChange={setFilters}
          authors={developers.map(d => d.name)}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total PRs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-warning" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">{stats.waiting}</p>
                  <p className="text-xs text-muted-foreground">Waiting</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-info" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">{stats.reviewing}</p>
                  <p className="text-xs text-muted-foreground">In Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-warning" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">{stats.commented}</p>
                  <p className="text-xs text-muted-foreground">Has Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-success" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-success" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">{stats.merged}</p>
                  <p className="text-xs text-muted-foreground">Merged</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">{stats.conflicts}</p>
                  <p className="text-xs text-muted-foreground">Conflicts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">{stats.urgent}</p>
                  <p className="text-xs text-muted-foreground">Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PR List */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="active">Active ({stats.total - stats.merged})</TabsTrigger>
            <TabsTrigger value="waiting">Waiting ({stats.waiting})</TabsTrigger>
            <TabsTrigger value="reviewing">Reviewing ({stats.reviewing})</TabsTrigger>
            <TabsTrigger value="commented">Commented ({stats.commented})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
            <TabsTrigger value="merged">Merged ({stats.merged})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterPRs('active').map((pr) => (
                <PRCard key={pr.id} pr={pr} onViewDetails={setSelectedPR} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="waiting" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterPRs('waiting').map((pr) => (
                <PRCard key={pr.id} pr={pr} onViewDetails={setSelectedPR} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviewing" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterPRs('reviewing').concat(filterPRs('assigned')).map((pr) => (
                <PRCard key={pr.id} pr={pr} onViewDetails={setSelectedPR} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="commented" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterPRs('commented').map((pr) => (
                <PRCard key={pr.id} pr={pr} onViewDetails={setSelectedPR} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterPRs('approved').map((pr) => (
                <PRCard key={pr.id} pr={pr} onViewDetails={setSelectedPR} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="merged" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterPRs('merged').map((pr) => (
                <PRCard key={pr.id} pr={pr} onViewDetails={setSelectedPR} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};