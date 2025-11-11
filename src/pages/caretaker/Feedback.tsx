import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { AlertCircle, MessageCircle, Lightbulb, HelpCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const feedbackSchema = z.object({
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  category: z.enum(['complaint', 'suggestion', 'feedback', 'other']),
  priority: z.enum(['low', 'medium', 'high']),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be less than 500 characters')
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface Feedback {
  id: string;
  subject: string;
  message: string;
  category: 'complaint' | 'suggestion' | 'feedback' | 'other';
  status: 'pending' | 'reviewed' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  adminResponse?: string;
  respondedAt?: Timestamp;
}

const categoryIcons = {
  complaint: AlertCircle,
  suggestion: Lightbulb,
  feedback: MessageCircle,
  other: HelpCircle
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
};

export default function Feedback() {
  const { user } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      subject: '',
      category: 'feedback',
      priority: 'medium',
      message: ''
    }
  });

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'feedback'),
      where('carerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbackData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Feedback[];

      feedbackData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setFeedbacks(feedbackData);
    });

    return () => unsubscribe();
  }, [user]);

  const onSubmit = async (data: FeedbackFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        carerId: user.uid,
        carerName: user.username || 'Unknown Carer',
        subject: data.subject,
        message: data.message,
        category: data.category,
        priority: data.priority,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      toast.success('Feedback submitted successfully!');
      form.reset();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Feedback & Complaints</h1>
            <p className="text-muted-foreground">
              Share your thoughts, suggestions, or concerns with management
            </p>
          </div>

          {/* Submit New Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Submit New Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief summary of your feedback" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="complaint">Complaint</SelectItem>
                              <SelectItem value="suggestion">Suggestion</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide detailed information about your feedback..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          {field.value.length}/500 characters
                        </p>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Previous Feedback Submissions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Your Submissions</h2>

            {feedbacks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    You haven't submitted any feedback yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => {
                  const CategoryIcon = categoryIcons[feedback.category];
                  return (
                    <Card key={feedback.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <CategoryIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate">
                                  {feedback.subject}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(feedback.createdAt.toDate(), 'MMM dd, yyyy • h:mm a')}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            <Badge className={statusColors[feedback.status]}>
                              {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                            </Badge>
                            <Badge className={priorityColors[feedback.priority]}>
                              {feedback.priority.charAt(0).toUpperCase() + feedback.priority.slice(1)} Priority
                            </Badge>
                            <Badge variant="outline">
                              {feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1)}
                            </Badge>
                          </div>

                          {/* Message */}
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {feedback.message}
                            </p>
                          </div>

                          {/* Admin Response */}
                          {feedback.adminResponse && (
                            <div className="border-l-4 border-primary pl-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">Admin Response</p>
                                {feedback.respondedAt && (
                                  <p className="text-xs text-muted-foreground">
                                    {format(feedback.respondedAt.toDate(), 'MMM dd, yyyy')}
                                  </p>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {feedback.adminResponse}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
