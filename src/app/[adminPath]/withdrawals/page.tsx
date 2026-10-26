
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { getEligibleForWithdrawalUsers } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

interface EligibleUser {
  uid: string;
  fullName: string;
  email: string;
  referralBalance: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export default function AdminWithdrawalsPage() {
  const [eligibleUsers, setEligibleUsers] = useState<EligibleUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEligibleUsers() {
      setLoading(true);
      const users = await getEligibleForWithdrawalUsers();
      setEligibleUsers(users);
      setLoading(false);
    }
    fetchEligibleUsers();
  }, []);
  
  const totalPayoutAmount = eligibleUsers.reduce((acc, user) => acc + user.referralBalance, 0);

  const handleExportToCSV = () => {
    const headers = ['Full Name', 'Email', 'Amount', 'Bank', 'Account Number', 'Account Name'];
    const csvRows = [headers.join(',')];

    const escapeCSV = (value: string | number) => {
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    eligibleUsers.forEach(user => {
        const row = [
            escapeCSV(user.fullName),
            escapeCSV(user.email),
            user.referralBalance,
            escapeCSV(user.bankName),
            escapeCSV(user.accountNumber),
            escapeCSV(user.accountName),
        ];
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'withdrawal_requests.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Withdrawal Summary</h2>
        <p className="text-muted-foreground">Summary of pending withdrawal requests.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Eligible Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{eligibleUsers.length}</div>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Payout Amount</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">₦{totalPayoutAmount.toLocaleString()}</div>}
                </CardContent>
            </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Users with a referral balance of ₦20,000 or more.</CardDescription>
            </div>
            <Button variant="outline" onClick={handleExportToCSV} disabled={loading || eligibleUsers.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
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
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Account Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eligibleUsers.length > 0 ? eligibleUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                          <span className="font-semibold p-2 rounded-md bg-muted">₦{user.referralBalance.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{user.bankName}</TableCell>
                      <TableCell>{user.accountNumber}</TableCell>
                      <TableCell>{user.accountName}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                            No users are currently eligible for withdrawal.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
