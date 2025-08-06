import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, GitBranch, Clock, FileText, Plus, Minus, MessageSquare, CheckCircle, X, GitMerge, Reply } from "lucide-react";
import { PullRequest, Comment } from "@/types/pr";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { NotificationService } from "@/services/notificationService";

interface PRDetailsProps {
  pr: PullRequest;
  onBack: () => void;
  onUpdate: (updatedPR: PullRequest) => void;
}

export const PRDetails = ({ pr, onBack, onUpdate }: PRDetailsProps) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const comment: Comment = {
      id: `c${Date.now()}`,
      author: pr.author, // In real app, this would be current user
      content: newComment,
      timestamp: new Date(),
      resolved: false,
      replies: []
    };

    const updatedPR = {
      ...pr,
      comments: [...pr.comments, comment],
      status: 'commented' as const,
      updatedAt: new Date()
    };

    onUpdate(updatedPR);
    setNewComment("");
    setIsLoading(false);
    
    toast({
      title: "Comment added",
      description: "Your comment has been added to the PR.",
    });

    // Notify reviewer if one is assigned
    if (pr.assignedReviewer) {
      NotificationService.notifyReminderToReviewer(pr.assignedReviewer, updatedPR);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedComments = pr.comments.map(comment => 
      comment.id === commentId ? { ...comment, resolved: true } : comment
    );
    
    const resolvedComments = updatedComments.filter(c => c.resolved);
    const unresolvedComments = updatedComments.filter(c => !c.resolved);
    
    const updatedPR = {
      ...pr,
      comments: updatedComments,
      status: unresolvedComments.length === 0 && pr.status === 'commented' ? 'reviewing' as const : pr.status,
      updatedAt: new Date()
    };

    onUpdate(updatedPR);
    setIsLoading(false);
    
    // Notify reviewer if all comments are addressed
    if (unresolvedComments.length === 0 && pr.assignedReviewer && resolvedComments.length > 0) {
      NotificationService.notifyCommentsAddressed(pr.assignedReviewer, updatedPR, resolvedComments);
    }
  };

  const handleReplyToComment = async (commentId: string) => {
    if (!replyText.trim()) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const reply: Comment = {
      id: `r${Date.now()}`,
      author: pr.author, // In real app, this would be current user
      content: replyText,
      timestamp: new Date(),
      resolved: false,
      replies: []
    };

    const updatedComments = pr.comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    });

    const updatedPR = {
      ...pr,
      comments: updatedComments,
      updatedAt: new Date()
    };

    onUpdate(updatedPR);
    setReplyText("");
    setReplyingTo(null);
    setIsLoading(false);
    
    toast({
      title: "Reply added",
      description: "Your reply has been added to the comment.",
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <p className="font-medium">{comment.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {comment.timestamp.toLocaleDateString()}
            </p>
            {comment.resolved ? (
              <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                Resolved
              </Badge>
            ) : (
              !isReply && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleResolveComment(comment.id)}
                  className="ml-2 h-6 text-xs"
                  disabled={isLoading}
                >
                  Mark as Resolved
                </Button>
              )
            )}
          </div>
          <p className="text-sm mb-2">{comment.content}</p>
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => handleReplyToComment(comment.id)}
                  disabled={isLoading || !replyText.trim()}
                  className="h-7 text-xs"
                >
                  Reply
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  const handleAutoAction = async (action: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let updatedPR = { ...pr };
    
    switch (action) {
      case 'assign':
        updatedPR.status = 'assigned';
        updatedPR.assignedReviewer = { id: '2', name: 'Auto Reviewer', email: 'auto@company.com', avatar: '' };
        updatedPR.nextAction = 'Waiting for review';
        // Notify the assigned reviewer
        if (updatedPR.assignedReviewer) {
          NotificationService.notifyReviewerAssignment(updatedPR.assignedReviewer, updatedPR);
        }
        break;
      case 'approve':
        updatedPR.status = 'approved';
        updatedPR.nextAction = 'Ready to merge';
        // Notify author of approval
        NotificationService.notifyAuthorOfReview(pr.author, updatedPR, 'approved');
        break;
      case 'merge':
        updatedPR.status = 'merged';
        updatedPR.nextAction = undefined;
        // Notify author of merge
        NotificationService.notifyAuthorOfReview(pr.author, updatedPR, 'merged');
        break;
    }
    
    updatedPR.updatedAt = new Date();
    onUpdate(updatedPR);
    setIsLoading(false);
    
    toast({
      title: "Action completed",
      description: `PR has been ${action}ed successfully.`,
    });
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
          <Badge className={getStatusColor(pr.status)}>
            {pr.status.toUpperCase()}
          </Badge>
        </div>

        {/* PR Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{pr.title}</CardTitle>
                <p className="text-muted-foreground">{pr.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={pr.author.avatar} alt={pr.author.name} />
                    <AvatarFallback>{pr.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{pr.author.name}</p>
                    <p className="text-sm text-muted-foreground">Author</p>
                  </div>
                </div>
                
                {pr.assignedReviewer && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={pr.assignedReviewer.avatar} alt={pr.assignedReviewer.name} />
                      <AvatarFallback>{pr.assignedReviewer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{pr.assignedReviewer.name}</p>
                      <p className="text-sm text-muted-foreground">Reviewer</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <GitBranch className="h-4 w-4 mr-1" />
                  {pr.branch} → {pr.targetBranch}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {pr.daysWaiting} days ago
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{pr.filesChanged}</span>
                <span className="text-sm text-muted-foreground">files changed</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Plus className="h-4 w-4 text-success" />
                <span className="font-medium text-success">{pr.linesAdded}</span>
                <span className="text-sm text-muted-foreground">additions</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Minus className="h-4 w-4 text-destructive" />
                <span className="font-medium text-destructive">{pr.linesDeleted}</span>
                <span className="text-sm text-muted-foreground">deletions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automation Actions */}
        {pr.automationEnabled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                Automation Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Next Scheduled Action</p>
                  <p className="text-sm text-muted-foreground">{pr.nextAction}</p>
                  {pr.nextActionDate && (
                    <p className="text-xs text-muted-foreground">
                      {pr.nextActionDate.toLocaleDateString()} at {pr.nextActionDate.toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {pr.status === 'waiting' && pr.daysWaiting >= 2 && (
                    <Button onClick={() => handleAutoAction('assign')} disabled={isLoading}>
                      Auto-Assign Reviewer
                    </Button>
                  )}
                  {pr.status === 'approved' && (
                    <Button onClick={() => handleAutoAction('merge')} disabled={isLoading}>
                      <GitMerge className="h-4 w-4 mr-2" />
                      Auto-Merge
                    </Button>
                  )}
                  {(pr.status === 'reviewing' || pr.status === 'assigned') && (
                    <Button onClick={() => handleAutoAction('approve')} variant="outline" disabled={isLoading}>
                      Auto-Approve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Comments ({pr.comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pr.comments.map(comment => (
                <div key={comment.id}>
                  {renderComment(comment)}
                  {comment !== pr.comments[pr.comments.length - 1] && <Separator className="mt-4" />}
                </div>
              ))}
              
              {pr.comments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No comments yet</p>
              )}
              
              <Separator />
              
              <div className="space-y-3">
                <p className="font-medium">Add a comment</p>
                <Textarea
                  placeholder="Write your comment here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={isLoading || !newComment.trim()}>
                  Add Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};