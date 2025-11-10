import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Mail, Phone, User, Lock, Pencil, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useFirebaseCollection } from '@/hooks/useFirebaseData';
import toast from 'react-hot-toast';
import CarerLocationMap from '@/components/CarerLocationMap';

interface Carer {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  password?: string;
  latitude?: number;
  longitude?: number;
  createdAt: any;
}

export default function Carers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [selectedCarer, setSelectedCarer] = useState<Carer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
  });

  const { data: carers, loading } = useFirebaseCollection<Carer>('carers');

  const filteredCarers = carers.filter(carer =>
    carer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    carer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check if username already exists
      const existingCarer = carers.find(c => c.username === formData.username);
      if (existingCarer) {
        toast.error('Username already exists');
        return;
      }

      await addDoc(collection(db, 'carers'), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      toast.success('Carer added successfully');
      setIsDialogOpen(false);
      setFormData({ name: '', email: '', phone: '', username: '', password: '' });
    } catch (error) {
      console.error('Error adding carer:', error);
      toast.error('Failed to add carer');
    }
  };

  const handleEditCarer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarer) return;
    
    try {
      // Check if username already exists (excluding current carer)
      const existingCarer = carers.find(c => c.username === selectedCarer.username && c.id !== selectedCarer.id);
      if (existingCarer) {
        toast.error('Username already exists');
        return;
      }

      await updateDoc(doc(db, 'carers', selectedCarer.id), {
        name: selectedCarer.name,
        email: selectedCarer.email,
        phone: selectedCarer.phone,
        username: selectedCarer.username,
        ...(selectedCarer.password && { password: selectedCarer.password }),
      });

      toast.success('Carer updated successfully');
      setIsEditDialogOpen(false);
      setSelectedCarer(null);
    } catch (error) {
      console.error('Error updating carer:', error);
      toast.error('Failed to update carer');
    }
  };

  const handleDeleteCarer = async () => {
    if (!selectedCarer) return;
    
    try {
      await deleteDoc(doc(db, 'carers', selectedCarer.id));
      toast.success('Carer deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedCarer(null);
    } catch (error) {
      console.error('Error deleting carer:', error);
      toast.error('Failed to delete carer');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Carers Management</h1>
            <p className="mt-1 text-muted-foreground">Manage your care team</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Add Carer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Carer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      className="pl-10"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-primary">
                  Add Carer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search carers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : filteredCarers.length === 0 ? (
            <p className="text-muted-foreground">No carers found</p>
          ) : (
            filteredCarers.map((carer) => (
              <motion.div
                key={carer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border bg-card p-4 shadow-soft transition-shadow hover:shadow-strong"
              >
                <h3 className="font-semibold text-foreground">{carer.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {carer.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {carer.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {carer.username}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {carer.latitude && carer.longitude && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCarer(carer);
                        setIsMapDialogOpen(true);
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedCarer(carer);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      setSelectedCarer(carer);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Carer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditCarer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={selectedCarer?.name || ''}
                  onChange={(e) => setSelectedCarer(selectedCarer ? { ...selectedCarer, name: e.target.value } : null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedCarer?.email || ''}
                  onChange={(e) => setSelectedCarer(selectedCarer ? { ...selectedCarer, email: e.target.value } : null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={selectedCarer?.phone || ''}
                  onChange={(e) => setSelectedCarer(selectedCarer ? { ...selectedCarer, phone: e.target.value } : null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="edit-username"
                    className="pl-10"
                    value={selectedCarer?.username || ''}
                    onChange={(e) => setSelectedCarer(selectedCarer ? { ...selectedCarer, username: e.target.value } : null)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="edit-password"
                    type="password"
                    className="pl-10"
                    placeholder="••••••••"
                    onChange={(e) => setSelectedCarer(selectedCarer ? { ...selectedCarer, password: e.target.value } : null)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-primary">
                Update Carer
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {selectedCarer?.name}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCarer} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Location Map Dialog */}
        <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {selectedCarer?.name}'s Location
              </DialogTitle>
            </DialogHeader>
            {selectedCarer?.latitude && selectedCarer?.longitude && (
              <CarerLocationMap
                latitude={selectedCarer.latitude}
                longitude={selectedCarer.longitude}
                carerName={selectedCarer.name}
              />
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
