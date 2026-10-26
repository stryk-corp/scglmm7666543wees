
'use client';

import { useEffect, useState } from 'react';
import { getSchoolEarnings } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, FileDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface SchoolEarning {
  id: string;
  universityName: string;
  totalEarnings: number;
  reportCount: number;
}

export default function AdminEarningsPage() {
    const [earnings, setEarnings] = useState<SchoolEarning[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEarnings() {
            setLoading(true);
            const fetchedEarnings = await getSchoolEarnings();
            fetchedEarnings.sort((a, b) => b.reportCount - a.reportCount);
            setEarnings(fetchedEarnings);
            setLoading(false);
        }
        fetchEarnings();
    }, []);

    const { totalReportsSold, totalRevenue } = earnings.reduce(
        (acc, earning) => {
            acc.totalReportsSold += earning.reportCount;
            acc.totalRevenue += earning.totalEarnings;
            return acc;
        },
        { totalReportsSold: 0, totalRevenue: 0 }
    );

    const handleExportToCSV = () => {
        const headers = ['University Name', 'Reports Sold', 'Total Earnings'];
        const csvRows = [headers.join(',')];

        const escapeCSV = (value: string | number) => {
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        earnings.forEach(earning => {
            const row = [
                escapeCSV(earning.universityName),
                earning.reportCount,
                earning.totalEarnings,
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\r\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'university_earnings.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Overall Earnings</h2>
                <p className="text-muted-foreground">Summary of all earnings across all universities.</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Reports Sold</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{totalReportsSold}</div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <CardTitle>Earnings by University</CardTitle>
                        <CardDescription>Total earnings and reports sold per university.</CardDescription>
                    </div>
                     <Button variant="outline" onClick={handleExportToCSV} disabled={loading || earnings.length === 0}>
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
                                    <TableHead>University Name</TableHead>
                                    <TableHead>Reports Sold</TableHead>
                                    <TableHead className="text-right">Total Earnings</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {earnings.map((earning) => (
                                    <TableRow key={earning.id}>
                                        <TableCell className="font-medium">{earning.universityName}</TableCell>
                                        <TableCell>{earning.reportCount}</TableCell>
                                        <TableCell className="text-right font-semibold">₦{earning.totalEarnings.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                {earnings.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">No earnings data available yet.</TableCell>
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
