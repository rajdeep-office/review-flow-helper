import { toast } from "@/hooks/use-toast";
import { Developer, PullRequest, Comment } from "@/types/pr";

export class NotificationService {
  static notifyReviewerAssignment(reviewer: Developer, pr: PullRequest) {
    toast({
      title: "Review Assignment",
      description: `${reviewer.name} has been assigned to review "${pr.title}"`,
      duration: 5000,
    });
    
    // In a real application, this would send an email/slack notification
    console.log(`Notification sent to ${reviewer.email}: You've been assigned to review PR "${pr.title}"`);
  }

  static notifyCommentsAddressed(reviewer: Developer, pr: PullRequest, resolvedComments: Comment[]) {
    toast({
      title: "Comments Addressed",
      description: `${resolvedComments.length} comment(s) have been addressed in "${pr.title}". Please review.`,
      duration: 5000,
    });
    
    // In a real application, this would send an email/slack notification
    console.log(`Notification sent to ${reviewer.email}: Comments have been addressed in PR "${pr.title}"`);
  }

  static notifyAuthorOfReview(author: Developer, pr: PullRequest, action: string) {
    toast({
      title: "PR Update",
      description: `Your PR "${pr.title}" has been ${action}`,
      duration: 5000,
    });
    
    console.log(`Notification sent to ${author.email}: Your PR "${pr.title}" has been ${action}`);
  }

  static notifyReminderToReviewer(reviewer: Developer, pr: PullRequest) {
    toast({
      title: "Review Reminder",
      description: `Reminder: Please review "${pr.title}"`,
      duration: 5000,
    });
    
    console.log(`Reminder sent to ${reviewer.email}: Please review PR "${pr.title}"`);
  }
}