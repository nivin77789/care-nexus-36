import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Users, User, Lock, Mail, Phone, MapPin, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Client {
  id: string;
  username: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: any;
}

export default function ManageClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClient, setNewClient] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'clients'),
      (snapshot) => {
        const clientData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Client[];
        setClients(clientData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newClient.username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (newClient.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newClient.name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    // Check if username already exists
    if (clients.some((client) => client.username === newClient.username)) {
      toast.error('Username already exists');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'clients'), {
        ...newClient,
        createdAt: new Date(),
      });

      toast.success('Client account created successfully');
      setNewClient({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        address: '',
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to create client account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete client "${name}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'clients', id));
      toast.success('Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Manage Client Accounts
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage client portal access</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Client Account</DialogTitle>
              <DialogDescription>
                Add a new client with login credentials and contact information
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddClient} className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter full name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      className="pl-10"
                      required
                      minLength={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="client@example.com"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Username *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-username"
                      type="text"
                      placeholder="Choose username"
                      value={newClient.username}
                      onChange={(e) => setNewClient({ ...newClient, username: e.target.value })}
                      className="pl-10"
                      required
                      minLength={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Set password"
                      value={newClient.password}
                      onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone number"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    placeholder="Full address"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="pl-10 min-h-[80px]"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Client Account
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Client Accounts</CardTitle>
            <CardDescription>
              {clients.length} client account{clients.length !== 1 ? 's' : ''} registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No client accounts yet</p>
                <p className="text-sm">Click "Add New Client" to create one</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.username}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {client.password}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {client.email && <div>{client.email}</div>}
                            {client.phone && <div>{client.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.createdAt
                            ? new Date(client.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClient(client.id, client.name)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
