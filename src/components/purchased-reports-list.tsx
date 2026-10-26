
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { ReportData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, FileText, Download, Info } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useNotification } from '@/context/notification-context';
import { REPORT_EXPIRATION_DAYS } from '@/lib/config';

export interface PurchasedReport extends ReportData {
  id: string;
  createdAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
  downloadCount: number;
}

interface PurchasedReportsListProps {
  onSelectReport: (report: PurchasedReport) => void;
  currentReportId: string | null;
}

export function PurchasedReportsList({ onSelectReport, currentReportId }: PurchasedReportsListProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { showNotification } = useNotification();
  const [reports, setReports] = useState<PurchasedReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  const toDate = (ts: Timestamp | Date): Date => ts instanceof Timestamp ? ts.toDate() : ts;

  useEffect(() => {
    if (!user || !firestore) return;

    setLoading(true);
    const reportsRef = collection(firestore, `users/${user.uid}/reports`);
    const q = query(reportsRef, where('expiresAt', '>', Timestamp.now()));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const purchasedReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as PurchasedReport));
      setReports(purchasedReports);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching purchased reports:", error);
      showNotification({ title: 'Error', message: 'Could not fetch your purchased reports.', type: 'error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, showNotification]);

  const handleSelect = (report: PurchasedReport) => {
    if (report.downloadCount <= 0) {
      showNotification({ title: 'No Downloads Left', message: 'You have used all available downloads for this report.', type: 'error' });
      return;
    }
    onSelectReport(report);
  };
  
  if (loading) {
    return (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading Your Reports...</p>
        </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="my-6 text-center bg-secondary/50 border-dashed">
          <CardHeader>
              <div className="mx-auto bg-background p-3 rounded-full w-fit mb-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">No Purchased Reports</CardTitle>
              <CardDescription>Go to the main page to create and finalize a new report.</CardDescription>
          </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>Your Purchased Reports</CardTitle>
        <CardDescription>Select a report to preview and download. Reports expire {REPORT_EXPIRATION_DAYS} days after purchase.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reports.map((report) => {
          const isSelected = report.id === currentReportId;
          const expiresAtDate = toDate(report.expiresAt);
          const createdAtDate = toDate(report.createdAt);
          const isExpired = expiresAtDate < new Date();
          const hasDownloads = report.downloadCount > 0;
          const canSelect = hasDownloads && !isExpired;

          return (
            <div key={report.id} className={ `border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${isSelected ? 'bg-primary/10 border-primary shadow-sm' : 'bg-background'}` }>
              <div className="flex-grow">
                <p className="font-semibold text-foreground">
                  {report.placeOfAttachment} Report -{' '}
                  <span className="font-normal text-sm">
                    {format(createdAtDate, 'MMMM d, yyyy')}
                  </span>
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                  <span className="flex items-center gap-1"><Download className="h-4 w-4" /> {report.downloadCount} download(s) left</span>
                  <span className="flex items-center gap-1">
                    <Info className="h-4 w-4" /> 
                    {`Expires ${formatDistanceToNow(expiresAtDate, { addSuffix: true })}`}
                  </span>
                </div>
              </div>
              <Button 
                onClick={() => handleSelect(report)}
                disabled={!canSelect || isSelected}
                className="w-full sm:w-auto"
              >
                {isSelected ? 'Selected' : 'Select to Download'}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
