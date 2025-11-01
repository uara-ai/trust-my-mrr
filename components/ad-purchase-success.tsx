"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, Sparkles, ArrowRight } from "lucide-react";
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
import { AdStartupSelector } from "./ad-startup-selector";

interface AdPurchaseSuccessProps {
  sessionId: string;
  onClose: () => void;
}

type Step = "success" | "select-startup" | "complete";

export function AdPurchaseSuccess({
  sessionId,
  onClose,
}: AdPurchaseSuccessProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const [step, setStep] = useState<Step>("success");

  const handleClose = () => {
    setIsClosing(true);
    // Remove query parameters from URL
    router.replace("/");
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleContinue = () => {
    setStep("select-startup");
  };

  const handleComplete = () => {
    setStep("complete");
  };

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
              {step === "complete" ? (
                <Sparkles className="h-8 w-8 text-green-500" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">
                {step === "success" && "Payment Successful!"}
                {step === "select-startup" && "Choose Your Startup"}
                {step === "complete" && "Ad Activated!"}
              </CardTitle>
              <CardDescription className="mt-1">
                {step === "success" && "Your ad spot has been purchased"}
                {step === "select-startup" &&
                  "Select which startup to advertise"}
                {step === "complete" && "Your ad is now live"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "success" && (
            <>
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
                    ✓ Payment Confirmed
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium mb-2">Next Step</p>
                <p className="text-sm text-muted-foreground">
                  Select which startup you want to advertise in this spot. You
                  can also add a custom tagline to make your ad stand out.
                </p>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">What's included:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>Monthly recurring ad spot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>Visible to all visitors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>Update tagline anytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>Cancel subscription anytime</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {step === "select-startup" && (
            <AdStartupSelector
              sessionId={sessionId}
              onComplete={handleComplete}
            />
          )}

          {step === "complete" && (
            <>
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-center">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  🎉 Your ad is now live and visible to visitors!
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium">What happens next?</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Your ad is visible immediately on the site</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>You'll receive email confirmations and updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Subscription renews monthly unless cancelled</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          {step === "success" && (
            <>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                Later
              </Button>
              <Button onClick={handleContinue} className="flex-1">
                Select Startup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}

          {step === "complete" && (
            <Button onClick={handleClose} className="w-full">
              Close & View Site
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
