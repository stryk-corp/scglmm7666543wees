import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ArrowDown, History, ShieldCheck, X } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { usePaystackPayment } from 'react-paystack';
import type { PaystackProps } from 'react-paystack/dist/types';
import { useNotification } from '@/context/notification-context';
import { verifyPaystackTransaction } from '@/app/actions/verify-payment';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { REPORT_PRICE, DOCUMENT_PRICES } from '@/lib/config';
import { cn } from '@/lib/utils';

const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;


interface TopUpWalletProps {
  balance: number;
  onClose: () => void;
  onReopen: () => void;
  currentUniversity: string;
}

export default function TopUpWallet({ balance, onClose, onReopen, currentUniversity }: TopUpWalletProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState(String(REPORT_PRICE));
  const [universityName, setUniversityName] = useState(currentUniversity);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  
  const balanceFormatter = new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  useEffect(() => {
    setUniversityName(currentUniversity);
  }, [currentUniversity]);

  useEffect(() => {
    if (!user || !firestore) return;

    const txQuery = query(
      collection(firestore, `users/${user.uid}/transactions`),
      orderBy('createdAt', 'desc')
    );
    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
    }, (error) => {
        console.error("Failed to fetch transactions:", error);
    });

    return () => unsubTx();
  }, [user, firestore]);

  const handleSuccess = async (reference: string) => {
    if (!user) return;
    
    if (!universityName) {
      showNotification({ title: 'Missing University', message: 'Please enter a university name.', type: 'error' });
      setLoading(false);
      onReopen();
      return;
    }

    setLoading(true);
    showNotification({ title: 'Verifying', message: 'Confirming transaction...', type: 'info' });
    
    const result = await verifyPaystackTransaction({
        reference,
        amount: Number(amount),
        universityName: universityName,
        userId: user.uid,
    });
    
    if (result.success) {
        showNotification({ 
            title: 'Success!', 
            message: `Wallet funded. New balance: ₦${result.newBalance?.toLocaleString()}`, 
            type: 'success' 
        });
        onClose(); // Keep wallet closed on success
    } else {
        showNotification({ title: 'Verification Failed', message: result.error || 'Could not verify transaction.', type: 'error' });
        onReopen(); // Reopen wallet on failure
    }
    setLoading(false);
  };
  
  const handleClose = () => {
    setLoading(false);
    showNotification({ title: 'Cancelled', message: 'Transaction cancelled.', type: 'info' });
    onReopen(); // Re-open our modal
  };
  
   const config: PaystackProps = {
    reference: '' + Math.floor((Math.random() * 1000000000) + 1),
    email: user?.email || '',
    amount: (Number(amount) || 0) * 100, // Amount in Kobo
    publicKey: PAYSTACK_KEY || '',
  };

  const initializePayment = usePaystackPayment(config);

  const handlePay = () => {
    if (!PAYSTACK_KEY) {
      showNotification({ title: 'Setup Required', message: 'Paystack public key is not configured.', type: 'error' });
      return;
    }
    if (!user?.email) {
      showNotification({ title: 'Email Required', message: 'Please set your email in your profile.', type: 'error' });
      return;
    }
    const topUpAmount = parseInt(amount, 10);
    if (isNaN(topUpAmount) || topUpAmount < 100) {
      showNotification({ title: 'Invalid Amount', message: 'Minimum top-up amount is ₦100.', type: 'error' });
      return;
    }
    if (!universityName) {
      showNotification({ title: 'University Name Required', message: 'Please enter the name of your university.', type: 'error' });
      return;
    }
    
    onClose(); // Close our wallet modal first

    // Initialize payment after a short delay to allow our modal to close
    setTimeout(() => {
        initializePayment({
            onSuccess: (response: any) => handleSuccess(response.reference),
            onClose: handleClose,
        });
    }, 150);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/80 hover:bg-muted border shadow-lg z-20">
          <X className="h-4 w-4" />
          <span className="sr-only">Close wallet</span>
        </Button>
      <div className="bg-card backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-xl border">
        
        <div className="flex justify-between items-start mb-6">
           <h2 className="text-lg font-bold text-foreground">My Wallet</h2>
        </div>
        
        <>
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-lg mb-8 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
            <div className="relative z-10">
                <p className="text-sm font-medium uppercase tracking-wider mb-2 opacity-80">Available Balance</p>
                <div className="flex items-baseline gap-1">
                <span className="text-2xl font-medium opacity-80">₦</span>
                <span className="text-4xl font-bold tracking-tight">{balanceFormatter.format(balance)}</span>
                </div>
                <div className="mt-6 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs font-medium">Live Updates</span>
                </div>
            </div>
            </div>

            <div className="space-y-4 mb-8">
            <div>
                <Label className="text-xs font-semibold">Amount to Top Up (₦)</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => setAmount('500')}
                    className={cn(
                      "py-2 px-2 rounded-xl border text-center transition-all",
                      amount === '500'
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40 text-primary font-bold shadow-xs"
                        : "border-border/80 bg-card hover:bg-muted/60 text-foreground"
                    )}
                  >
                    <span className="text-xs font-bold font-mono block">₦500</span>
                    <span className="text-[10px] text-muted-foreground block">Essay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('1500')}
                    className={cn(
                      "py-2 px-2 rounded-xl border text-center transition-all",
                      amount === '1500'
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40 text-primary font-bold shadow-xs"
                        : "border-border/80 bg-card hover:bg-muted/60 text-foreground"
                    )}
                  >
                    <span className="text-xs font-bold font-mono block">₦1,500</span>
                    <span className="text-[10px] text-muted-foreground block">Term Paper</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('5000')}
                    className={cn(
                      "py-2 px-2 rounded-xl border text-center transition-all",
                      amount === '5000'
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40 text-primary font-bold shadow-xs"
                        : "border-border/80 bg-card hover:bg-muted/60 text-foreground"
                    )}
                  >
                    <span className="text-xs font-bold font-mono block">₦5,000</span>
                    <span className="text-[10px] text-muted-foreground block">SIWES / IT</span>
                  </button>
                </div>
                <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e: any) => setAmount(e.target.value)} 
                    disabled={loading}
                    placeholder="Enter custom amount"
                    className="h-10 text-sm font-mono"
                />
            </div>

            <div>
                <Label>University Name</Label>
                <Input 
                    type="text" 
                    value={universityName} 
                    onChange={(e: any) => setUniversityName(e.target.value)} 
                    placeholder="e.g., University of Nigeria, Nsukka"
                    disabled={loading}
                />
            </div>
            
            <div>
                <Label>Email for Receipt</Label>
                <Input 
                    type="email" 
                    value={user?.email || ''} 
                    placeholder="name@example.com"
                    disabled
                />
            </div>

            <Button onClick={handlePay} disabled={loading || !user} className="w-full h-12 text-base">
                {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 w-5 h-5" />}
                {loading ? 'Processing...' : 'Pay Securely'}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground flex justify-center items-center gap-1">
                <ShieldCheck size={10} /> Secured by Paystack
            </p>
            </div>

            <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-bold text-sm">Recent Activity</h3>
            </div>
            
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {transactions.length > 0 ? (
                transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-green-500 shadow-sm">
                            <ArrowDown size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">Top Up</p>
                            <p className="text-xs text-muted-foreground font-medium">
                                {tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                            </p>
                        </div>
                        </div>
                        <span className="font-bold text-green-500 text-sm">
                        +₦{balanceFormatter.format(tx.amount)}
                        </span>
                    </div>
                ))
                ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">No transactions yet</p>
                </div>
                )}
            </div>
            </div>
        </>
        
      </div>
    </div>
  );
}
