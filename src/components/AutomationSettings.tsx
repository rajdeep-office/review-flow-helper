import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Settings, Users, Clock, GitMerge, MessageSquare } from "lucide-react";
import { AutomationSettings as IAutomationSettings } from "@/types/pr";
import { developers } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface AutomationSettingsProps {
  onBack: () => void;
}

export const AutomationSettings = ({ onBack }: AutomationSettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<IAutomationSettings>({
    waitDays: 2,
    autoAssign: true,
    autoReview: true,
    autoMerge: true,
    reminderInterval: 24,
    excludedAuthors: [],
    reviewerPool: ['2', '3', '4'] // Bob, Carol, David
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    toast({
      title: "Settings saved",
      description: "Your automation settings have been updated successfully.",
    });
  };

  const toggleReviewer = (developerId: string) => {
    setSettings(prev => ({
      ...prev,
      reviewerPool: prev.reviewerPool.includes(developerId)
        ? prev.reviewerPool.filter(id => id !== developerId)
        : [...prev.reviewerPool, developerId]
    }));
  };

  const toggleExcludedAuthor = (developerId: string) => {
    setSettings(prev => ({
      ...prev,
      excludedAuthors: prev.excludedAuthors.includes(developerId)
        ? prev.excludedAuthors.filter(id => id !== developerId)
        : [...prev.excludedAuthors, developerId]
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold">Automation Settings</h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Timing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="waitDays">Wait Days Before Action</Label>
                <Input
                  id="waitDays"
                  type="number"
                  min="1"
                  max="7"
                  value={settings.waitDays}
                  onChange={(e) => setSettings(prev => ({ ...prev, waitDays: parseInt(e.target.value) || 2 }))}
                />
                <p className="text-xs text-muted-foreground">
                  Number of days to wait before taking any automated action
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderInterval">Reminder Interval (hours)</Label>
                <Input
                  id="reminderInterval"
                  type="number"
                  min="1"
                  max="168"
                  value={settings.reminderInterval}
                  onChange={(e) => setSettings(prev => ({ ...prev, reminderInterval: parseInt(e.target.value) || 24 }))}
                />
                <p className="text-xs text-muted-foreground">
                  How often to send reminders to reviewers
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Automation Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitMerge className="h-5 w-5 mr-2" />
                Automation Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-assign Reviewers</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically assign reviewers after wait period
                  </p>
                </div>
                <Switch
                  checked={settings.autoAssign}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAssign: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-review PRs</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically review and comment on PRs
                  </p>
                </div>
                <Switch
                  checked={settings.autoReview}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoReview: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-merge</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically merge approved PRs
                  </p>
                </div>
                <Switch
                  checked={settings.autoMerge}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoMerge: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reviewer Pool */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Reviewer Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Select developers who can be automatically assigned as reviewers
              </p>
              <div className="space-y-3">
                {developers.map((dev) => (
                  <div key={dev.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {dev.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{dev.name}</p>
                        <p className="text-xs text-muted-foreground">{dev.email}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.reviewerPool.includes(dev.id)}
                      onCheckedChange={() => toggleReviewer(dev.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Excluded Authors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Excluded Authors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Authors whose PRs will not be processed by automation
              </p>
              <div className="space-y-3">
                {developers.map((dev) => (
                  <div key={dev.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {dev.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{dev.name}</p>
                        <p className="text-xs text-muted-foreground">{dev.email}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.excludedAuthors.includes(dev.id)}
                      onCheckedChange={() => toggleExcludedAuthor(dev.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Automation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Wait period:</span>
                <Badge variant="outline">{settings.waitDays} day{settings.waitDays !== 1 ? 's' : ''}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Active reviewers:</span>
                <Badge variant="outline">{settings.reviewerPool.length} developers</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Excluded authors:</span>
                <Badge variant="outline">{settings.excludedAuthors.length} developers</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Features enabled:</span>
                <div className="flex space-x-2">
                  {settings.autoAssign && <Badge className="bg-success text-success-foreground">Auto-assign</Badge>}
                  {settings.autoReview && <Badge className="bg-info text-info-foreground">Auto-review</Badge>}
                  {settings.autoMerge && <Badge className="bg-primary text-primary-foreground">Auto-merge</Badge>}
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};