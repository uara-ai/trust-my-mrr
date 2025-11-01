"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdPurchaseSuccessProps {
  sessionId: string;
  onClose: () => void;
}

export function AdPurchaseSuccess({
  sessionId,
  onClose,
}: AdPurchaseSuccessProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Remove query parameters from URL
    router.replace("/");
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Auto-close after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card
        className={`w-full max-w-lg shadow-2xl border-green-500/50 ${
          isClosing
            ? "animate-out fade-out zoom-out-95 duration-200"
            : "animate-in zoom-in-95 fade-in duration-300"
        }`}
      >
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-4 top-4 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/10 p-2">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription className="mt-1">
                Your ad spot has been purchased
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Session ID:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {sessionId.slice(0, 20)}...
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="default" className="bg-green-500">
                ✓ Confirmed
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">What happens next?</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>
                  Your ad will be activated within 24 hours after we review your
                  submission
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>
                  You'll receive an email confirmation with your ad details
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>
                  Your subscription will automatically renew monthly unless
                  cancelled
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">
                Need to provide ad content?
              </strong>{" "}
              We'll send you a link to submit your startup logo, tagline, and
              description.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={handleClose} variant="outline" className="flex-1">
            Continue Browsing
          </Button>
          <Button
            onClick={() => {
              window.open("https://stripe.com/docs", "_blank");
            }}
            variant="default"
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Receipt
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
