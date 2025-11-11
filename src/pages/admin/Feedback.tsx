import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { motion } from 'framer-motion';
import { AlertCircle, MessageCircle, Lightbulb, HelpCircle, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Feedback {
  id: string;
  carerId: string;
  carerName: string;
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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState<'pending' | 'reviewed' | 'resolved'>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'feedback'), (snapshot) => {
      const feedbackData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Feedback[];

      feedbackData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setFeedbacks(feedbackData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = feedbacks;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.carerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(f => f.category === categoryFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(f => f.priority === priorityFilter);
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setAdminResponse(feedback.adminResponse || '');
    setNewStatus(feedback.status);
  };

  const handleCloseDialog = () => {
    setSelectedFeedback(null);
    setAdminResponse('');
    setNewStatus('pending');
  };

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;

    setIsSubmitting(true);
    try {
      const updates: any = {
        status: newStatus
      };

      if (adminResponse.trim()) {
        updates.adminResponse = adminResponse.trim();
        updates.respondedAt = Timestamp.now();
        updates.respondedBy = 'Admin';
      }

      await updateDoc(doc(db, 'feedback', selectedFeedback.id), updates);

      toast.success('Feedback updated successfully!');
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    highPriority: feedbacks.filter(f => f.priority === 'high').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Feedback Management</h1>
            <p className="text-muted-foreground">View and respond to carer feedback and complaints</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Feedback</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-3xl font-bold text-red-600">{stats.highPriority}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by carer or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Table */}
          <Card>
            <CardContent className="pt-6">
              {filteredFeedbacks.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No feedback found matching your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Carer</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedbacks.map((feedback) => {
                        const CategoryIcon = categoryIcons[feedback.category];
                        return (
                          <TableRow key={feedback.id} className="hover:bg-muted/50">
                            <TableCell className="whitespace-nowrap">
                              {format(feedback.createdAt.toDate(), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="font-medium">{feedback.carerName}</TableCell>
                            <TableCell className="max-w-xs truncate">{feedback.subject}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CategoryIcon className="h-4 w-4" />
                                <span className="capitalize">{feedback.category}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={priorityColors[feedback.priority]}>
                                {feedback.priority.charAt(0).toUpperCase() + feedback.priority.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[feedback.status]}>
                                {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewFeedback(feedback)}
                              >
                                View & Respond
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Feedback Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const CategoryIcon = categoryIcons[selectedFeedback.category];
                    return <CategoryIcon className="h-5 w-5" />;
                  })()}
                  Feedback Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={statusColors[selectedFeedback.status]}>
                      {selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1)}
                    </Badge>
                    <Badge className={priorityColors[selectedFeedback.priority]}>
                      {selectedFeedback.priority.charAt(0).toUpperCase() + selectedFeedback.priority.slice(1)} Priority
                    </Badge>
                    <Badge variant="outline">
                      {selectedFeedback.category.charAt(0).toUpperCase() + selectedFeedback.category.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted by <span className="font-medium text-foreground">{selectedFeedback.carerName}</span> on{' '}
                    {format(selectedFeedback.createdAt.toDate(), 'MMMM dd, yyyy • h:mm a')}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Subject</h3>
                  <p className="text-foreground">{selectedFeedback.subject}</p>
                </div>

                {/* Message */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Message</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-foreground whitespace-pre-wrap">{selectedFeedback.message}</p>
                  </div>
                </div>

                {/* Previous Admin Response */}
                {selectedFeedback.adminResponse && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Previous Response</h3>
                    <div className="border-l-4 border-primary pl-4 bg-muted/30 rounded-r-lg p-4">
                      <p className="text-muted-foreground">{selectedFeedback.adminResponse}</p>
                      {selectedFeedback.respondedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded on {format(selectedFeedback.respondedAt.toDate(), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Response Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold block mb-2">Admin Response</label>
                    <Textarea
                      placeholder="Enter your response to the carer..."
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">Update Status</label>
                    <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateFeedback} disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Feedback'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
