
'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { getAllUsers, getUserReports, updateUserData } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Save, FileText, University, User as UserIcon, Mail, FileDown, Users, Wallet, Percent, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserProfileData, ReportData } from '@/lib/types';
import { getDocumentPrice } from '@/lib/config';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotification } from '@/context/notification-context';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface UserData extends UserProfileData {
    uid: string;
    email: string;
    balance: number;
}

interface FullReportData extends ReportData {
  id: string;
  createdAt: string | null;
}

const UserDetails = ({ user, reports, onSave }: { user: UserData; reports: FullReportData[], onSave: (userId: string, data: Partial<UserProfileData & { balance: number }>) => Promise<void> }) => {
    const [editableUser, setEditableUser] = useState(user);
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const isNumber = ['balance', 'referralBalance', 'referralCount', 'referralCommissionRate'].includes(id);
        setEditableUser(prev => ({ ...prev, [id]: isNumber ? Number(value) : value }));
    };
    
    const handleSwitchChange = (checked: boolean) => {
        setEditableUser(prev => ({ ...prev, isReferralActive: checked }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const dataToSave = {
            fullName: editableUser.fullName,
            regNumber: editableUser.regNumber,
            universityName: editableUser.universityName,
            facultyName: editableUser.facultyName,
            departmentName: editableUser.departmentName,
            balance: editableUser.balance,
            isReferralActive: editableUser.isReferralActive,
            referralCount: editableUser.referralCount,
            referralBalance: editableUser.referralBalance,
            referralCommissionRate: editableUser.referralCommissionRate,
            bankName: editableUser.bankName,
            accountNumber: editableUser.accountNumber,
            accountName: editableUser.accountName
        };
        await onSave(user.uid, dataToSave as any);
        setIsSaving(false);
    };

    const totalPaid = useMemo(
        () => reports.reduce((total, report) => total + (report.generationPayment?.amount ?? getDocumentPrice(report.documentType)), 0),
        [reports]
    );

    return (
        <div className="p-4 bg-muted/50 rounded-lg space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={editableUser.fullName} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={editableUser.email} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="regNumber">Registration Number</Label>
                    <Input id="regNumber" value={editableUser.regNumber} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="universityName">University</Label>
                    <Input id="universityName" value={editableUser.universityName} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="facultyName">Faculty</Label>
                    <Input id="facultyName" value={editableUser.facultyName} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="departmentName">Department</Label>
                    <Input id="departmentName" value={editableUser.departmentName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="balance">Balance</Label>
                    <Input id="balance" type="number" value={editableUser.balance} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" value={editableUser.bankName} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" value={editableUser.accountNumber} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input id="accountName" value={editableUser.accountName} onChange={handleInputChange} />
                </div>
                <div className="flex flex-col space-y-3 rounded-lg border p-4 bg-background">
                    <Label htmlFor="referral-switch">Referral Status</Label>
                    <div className="flex items-center space-x-2">
                        <Switch id="referral-switch" checked={editableUser.isReferralActive} onCheckedChange={handleSwitchChange} />
                        <Label htmlFor="referral-switch">{editableUser.isReferralActive ? "Active" : "Inactive"}</Label>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="referralCount">Referral Count</Label>
                    <Input id="referralCount" type="number" value={editableUser.referralCount} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="referralBalance">Referral Balance</Label>
                    <Input id="referralBalance" type="number" value={editableUser.referralBalance} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="referredBy">Referred By (User ID)</Label>
                    <Input id="referredBy" value={editableUser.referredBy || 'N/A'} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="referralCommissionRate">Referral Commission Rate (%)</Label>
                    <Input id="referralCommissionRate" type="number" value={editableUser.referralCommissionRate || ''} onChange={handleInputChange} placeholder="Default (10%)" />
                </div>
                
                 {/* Tracking Info */}
                <div className="md:col-span-2 lg:col-span-3 border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-2 flex items-center"><Route className="h-4 w-4 mr-2"/>Tracking Information</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><span className="font-medium">Source:</span> {user.utm_source || 'N/A'}</div>
                        <div><span className="font-medium">Medium:</span> {user.utm_medium || 'N/A'}</div>
                        <div><span className="font-medium">Campaign:</span> {user.utm_campaign || 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
                <Badge variant="secondary" className="flex items-center gap-2"><FileText className="h-3 w-3" />Reports Purchased: {reports.length}</Badge>
                <Badge variant="secondary" className="flex items-center gap-2"><Wallet className="h-3 w-3" />Total Spent: ₦{totalPaid.toLocaleString()}</Badge>
                <Badge variant="outline" className="flex items-center gap-2"><Users className="h-3 w-3" />Referred Users: {user.referralCount}</Badge>
                 <Badge variant="outline" className="flex items-center gap-2"><Wallet className="h-3 w-3" />Referral Earnings: ₦{(user.referralBalance || 0).toLocaleString()}</Badge>
            </div>

            <div className="space-y-2">
                <h4 className="font-semibold">Purchased Reports</h4>
                {reports.length > 0 ? (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Report (Place of Attachment)</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map(report => (
                                    <TableRow key={report.id}>
                                        <TableCell>{report.placeOfAttachment}</TableCell>
                                        <TableCell>{report.createdAt}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ) : (
                    <p className="text-sm text-muted-foreground">This user has not purchased any reports yet.</p>
                )}
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
};

const UserAccordionItem = ({ user, onSave }: { user: UserData; onSave: (userId: string, data: Partial<UserProfileData & { balance: number }>) => Promise<void> }) => {
    const [reports, setReports] = useState<FullReportData[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    const fetchReports = async () => {
        if (reports.length > 0) return; 
        setIsLoadingReports(true);
        const fetchedReports = await getUserReports(user.uid);
        setReports(fetchedReports as FullReportData[]);
        setIsLoadingReports(false);
    };

    return (
        <AccordionItem value={user.uid}>
            <AccordionTrigger onClick={fetchReports}>
                <div className="flex justify-between items-center w-full pr-4">
                    <div className="flex flex-col text-left">
                        <span className="font-medium">{user.fullName}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                     <div className="flex items-center gap-4">
                        {user.referralCommissionRate && user.referralCommissionRate !== 10 && (
                            <Badge variant="secondary" className="flex items-center gap-1"><Percent className="h-3 w-3" /> {user.referralCommissionRate}%</Badge>
                        )}
                        {user.isReferralActive && <Badge variant="default">Referral Active</Badge>}
                        <Badge variant={user.balance > 0 ? 'outline' : 'secondary'}>
                            Wallet: ₦{user.balance.toLocaleString()}
                        </Badge>
                     </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {isLoadingReports ? (
                     <div className="flex justify-center items-center py-10">
                        <Loader2 className="animate-spin h-6 w-6 text-primary" />
                     </div>
                ) : (
                    <UserDetails user={user} reports={reports} onSave={onSave} />
                )}
            </AccordionContent>
        </AccordionItem>
    );
};


export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const auth = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);


  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }
    if (pathname) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchTerm, pathname, router, searchParams]);
  
  const handleSaveChanges = useCallback(async (userId: string, data: Partial<UserProfileData & { balance: number }>) => {
    if (!auth.currentUser) {
        showNotification({ title: "Error", message: "You are not authenticated.", type: 'error' });
        return;
    }
    try {
        const result = await updateUserData(userId, data);

        if (result && result.success) {
            showNotification({ title: "Success", message: "User data has been updated.", type: 'success' });
            setUsers(prevUsers => prevUsers.map(u => u.uid === userId ? { ...u, ...data } : u));
        } else {
            showNotification({ title: "Error", message: (result && result.error) || "Failed to update user data.", type: 'error' });
        }
    } catch(e: any) {
        showNotification({ title: "Error", message: e.message || "An unexpected error occurred.", type: 'error' });
    }
  }, [showNotification, auth]);

  const filteredUsers = useMemo(() => {
    const term = (searchParams?.get('search') || '').toLowerCase();
    if (!term) return users;
    return users.filter(user => 
        (user.email || '').toLowerCase().includes(term) ||
        (user.fullName || '').toLowerCase().includes(term)
    );
  }, [users, searchParams]);

  const handleExportToCSV = () => {
    const headers = [
        'uid', 'email', 'fullName', 'regNumber', 'universityName', 'facultyName', 'departmentName', 'balance', 'isReferralActive', 'referralCount', 'referralBalance', 'referralCommissionRate', 'referredBy', 'bankName', 'accountNumber', 'accountName'
    ];
    
    const escapeCSV = (value: string | number | boolean | undefined | null) => {
        const str = String(value ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvRows = [headers.join(',')];
    filteredUsers.forEach(user => {
        const row = headers.map(header => escapeCSV(user[header as keyof UserData]));
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'users_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
          <CardDescription>The total number of registered users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <div className="text-4xl font-bold">{users.length}</div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle>Registered Users</CardTitle>
                  <CardDescription>A list of all users who have signed up. Click on a user to view and edit their details.</CardDescription>
              </div>
              <Button variant="outline" onClick={handleExportToCSV} disabled={loading || filteredUsers.length === 0}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export to CSV
              </Button>
          </div>
          <div className="relative pt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                  placeholder="Search by email or name..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredUsers.map((user) => (
                  <UserAccordionItem key={user.uid} user={user} onSave={handleSaveChanges} />
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
