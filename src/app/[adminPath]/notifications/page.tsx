
'use client';

import { useEffect, useState, useMemo } from 'react';
import { addGlobalNotification, getAllGlobalNotifications, updateGlobalNotification, deleteGlobalNotification } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, BellPlus, Send, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/context/notification-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface AdminNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const { showNotification } = useNotification();
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<AdminNotification | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        const fetchedNotifications = await getAllGlobalNotifications();
        setNotifications(fetchedNotifications);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleSendNotification = async () => {
        if (!title || !body) {
            showNotification({ title: 'Error', message: 'Title and body are required.', type: 'error' });
            return;
        }
        setIsSending(true);
        const result = await addGlobalNotification({ title, body });
        if (result.success) {
            showNotification({ title: 'Success', message: 'Global notification sent!', type: 'success' });
            setTitle('');
            setBody('');
            setIsCreateModalOpen(false);
            await fetchNotifications(); // Refresh the list
        } else {
            showNotification({ title: 'Error', message: result.error || 'Failed to send notification.', type: 'error' });
        }
        setIsSending(false);
    };

    const handleEditClick = (notification: AdminNotification) => {
        setEditingNotification(notification);
        setIsEditModalOpen(true);
    };

    const handleUpdateNotification = async () => {
        if (!editingNotification) return;
        setIsSending(true);
        const result = await updateGlobalNotification(editingNotification.id, { title: editingNotification.title, body: editingNotification.body });
        if (result.success) {
            showNotification({ title: 'Success', message: 'Notification updated.', type: 'success' });
            setIsEditModalOpen(false);
            setEditingNotification(null);
            await fetchNotifications();
        } else {
            showNotification({ title: 'Error', message: result.error || 'Failed to update notification.', type: 'error' });
        }
        setIsSending(false);
    };
    
    const handleDeleteNotification = async (id: string) => {
        const result = await deleteGlobalNotification(id);
        if (result.success) {
            showNotification({ title: 'Deleted', message: 'Notification has been removed.', type: 'success' });
            await fetchNotifications();
        } else {
            showNotification({ title: 'Error', message: result.error || 'Failed to delete notification.', type: 'error' });
        }
    };


    return (
        <div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Global Notifications</CardTitle>
                        <CardDescription>A list of all global notifications sent to users.</CardDescription>
                    </div>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <BellPlus className="mr-2 h-4 w-4" />
                                New Notification
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Send Global Notification</DialogTitle>
                                <DialogDescription>This message will be sent to all users.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notif-title">Title</Label>
                                    <Input id="notif-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., System Maintenance" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notif-body">Body</Label>
                                    <Textarea id="notif-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Enter the notification message..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleSendNotification} disabled={isSending}>
                                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Send to All Users
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Date Sent</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.length > 0 ? notifications.map((notif) => (
                                    <TableRow key={notif.id}>
                                        <TableCell className="font-medium">{notif.title}</TableCell>
                                        <TableCell className="max-w-sm truncate">{notif.body}</TableCell>
                                        <TableCell>{notif.createdAt}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(notif)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the notification "{notif.title}". This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteNotification(notif.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No notifications have been sent yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {editingNotification && (
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Notification</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="edit-notif-title">Title</Label>
                                <Input id="edit-notif-title" value={editingNotification.title} onChange={(e) => setEditingNotification({...editingNotification, title: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-notif-body">Body</Label>
                                <Textarea id="edit-notif-body" value={editingNotification.body} onChange={(e) => setEditingNotification({...editingNotification, body: e.target.value})} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateNotification} disabled={isSending}>
                                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
