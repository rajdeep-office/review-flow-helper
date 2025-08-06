import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, GitBranch, MessageSquare, Plus, Minus, FileText } from "lucide-react";
import { PullRequest } from "@/types/pr";
import { Button } from "@/components/ui/button";

interface PRCardProps {
  pr: PullRequest;
  onViewDetails: (pr: PullRequest) => void;
}

export const PRCard = ({ pr, onViewDetails }: PRCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-warning text-warning-foreground';
      case 'assigned': return 'bg-info text-info-foreground';
      case 'reviewing': return 'bg-primary text-primary-foreground';
      case 'commented': return 'bg-warning text-warning-foreground';
      case 'approved': return 'bg-success text-success-foreground';
      case 'merged': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Waiting';
      case 'assigned': return 'Assigned';
      case 'reviewing': return 'In Review';
      case 'commented': return 'Has Comments';
      case 'approved': return 'Approved';
      case 'merged': return 'Merged';
      default: return status;
    }
  };

  return (
    <Card className="hover:shadow-medium transition-all duration-200 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {pr.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {pr.description}
            </p>
          </div>
          <Badge className={`ml-2 ${getStatusColor(pr.status)}`}>
            {getStatusText(pr.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={pr.author.avatar} alt={pr.author.name} />
              <AvatarFallback>{pr.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{pr.author.name}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <GitBranch className="h-3 w-3 mr-1" />
                {pr.branch} → {pr.targetBranch}
              </div>
            </div>
          </div>
          
          {pr.assignedReviewer && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Reviewer:</span>
              <Avatar className="h-6 w-6">
                <AvatarImage src={pr.assignedReviewer.avatar} alt={pr.assignedReviewer.name} />
                <AvatarFallback className="text-xs">
                  {pr.assignedReviewer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {pr.daysWaiting} day{pr.daysWaiting !== 1 ? 's' : ''} ago
            </div>
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              {pr.filesChanged} files
            </div>
            <div className="flex items-center">
              <Plus className="h-3 w-3 mr-1 text-success" />
              {pr.linesAdded}
            </div>
            <div className="flex items-center">
              <Minus className="h-3 w-3 mr-1 text-destructive" />
              {pr.linesDeleted}
            </div>
          </div>
          
          {pr.comments.length > 0 && (
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              {pr.comments.length}
            </div>
          )}
        </div>

        {pr.nextAction && (
          <div className="bg-accent/50 rounded-lg p-3 mb-3">
            <p className="text-xs font-medium text-accent-foreground">Next Action:</p>
            <p className="text-sm text-accent-foreground">{pr.nextAction}</p>
            {pr.nextActionDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {pr.nextActionDate.toLocaleDateString()} at {pr.nextActionDate.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full"
          onClick={() => onViewDetails(pr)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};