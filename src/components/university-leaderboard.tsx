
'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

interface SchoolEarning {
  id: string;
  universityName: string;
  totalEarnings: number;
  reportCount: number;
}

const getRankColor = (rank: number) => {
    if (rank === 0) return "text-yellow-400";
    if (rank === 1) return "text-gray-400";
    if (rank === 2) return "text-yellow-600";
    return "text-muted-foreground";
}

export function UniversityLeaderboard() {
  const [earnings, setEarnings] = useState<SchoolEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    setLoading(true);
    setError(null);
    const earningsRef = collection(firestore, 'schoolEarnings');
    const q = query(earningsRef, orderBy('reportCount', 'desc'), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEarnings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SchoolEarning));
      setEarnings(fetchedEarnings);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching school earnings: ", error);
        setError('University activity could not be loaded. Please try again later.');
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  return (
    <Card className="bg-card border-border shadow-md rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        {loading ? (
            <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="w-16 text-center font-semibold text-muted-foreground">Rank</TableHead>
                <TableHead className="font-semibold text-muted-foreground">University</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Reports Generated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((earning, index) => (
                <TableRow key={earning.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center font-bold">
                    <div className="flex justify-center items-center">
                        <Trophy className={`h-5 w-5 ${getRankColor(index)}`} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{earning.universityName}</TableCell>
                  <TableCell className="text-right font-semibold font-mono text-primary">{earning.reportCount}</TableCell>
                </TableRow>
              ))}
              {error && (
                <TableRow>
                  <TableCell colSpan={3} role="alert" className="text-center text-destructive py-10 font-medium">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!error && earnings.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-10 font-medium">
                        No university reports recorded yet. Be the first to generate for your school!
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
