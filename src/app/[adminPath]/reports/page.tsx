
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { getAllReports, updateReportData } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Download } from 'lucide-react';
import { ReportData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FullReportData extends ReportData {
  id: string;
  user: {
      uid: string;
      name: string;
  };
  createdAt: string;
  expiresAt: string;
  downloadCount: number;
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<FullReportData[]>([]);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    useEffect(() => {
        async function fetchReports() {
            setLoading(true);
            const fetchedReports = await getAllReports();
            setReports(fetchedReports as FullReportData[]);
            setLoading(false);
        }
        fetchReports();
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
    
    const handleDownloadCountChange = async (userId: string, reportId: string, newCount: number) => {
        await updateReportData(userId, reportId, { downloadCount: newCount });
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, downloadCount: newCount } : r));
    };

    const filteredReports = useMemo(() => {
        const term = (searchParams?.get('search') || '').toLowerCase();
        if (!term) return reports;
        return reports.filter(report =>
            (report.user.name || '').toLowerCase().includes(term) ||
            (report.placeOfAttachment || '').toLowerCase().includes(term)
        );
    }, [reports, searchParams]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Total Reports</CardTitle>
                <CardDescription>The total number of reports purchased on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                {loading ? (
                    <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
                ) : (
                    <div className="text-4xl font-bold">{reports.length}</div>
                )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>All Purchased Reports</CardTitle>
                    <CardDescription>A list of all reports purchased by users.</CardDescription>
                    <div className="relative pt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by user name or place of attachment..."
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Report (Place of Attachment)</TableHead>
                                    <TableHead>Date Purchased</TableHead>
                                    <TableHead>Expires On</TableHead>
                                    <TableHead className="text-center w-36">Downloads Left</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-medium">{report.user.name}</TableCell>
                                        <TableCell>{report.placeOfAttachment}</TableCell>
                                        <TableCell>{report.createdAt}</TableCell>
                                        <TableCell>{report.expiresAt}</TableCell>
                                        <TableCell className="text-center">
                                            <Input
                                                type="number"
                                                className="w-24 mx-auto text-center"
                                                value={report.downloadCount}
                                                onChange={(e) => handleDownloadCountChange(report.user.uid, report.id, parseInt(e.target.value))}
                                                min="0"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
