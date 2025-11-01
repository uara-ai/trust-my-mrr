"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AdPurchaseSuccess } from "./ad-purchase-success";

export function AdPurchaseSuccessWrapper() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const adPurchase = searchParams.get("ad_purchase");
    const session = searchParams.get("session_id");

    if (adPurchase === "success" && session) {
      setSessionId(session);
      setShowSuccess(true);
    }
  }, [searchParams]);

  if (!showSuccess || !sessionId) {
    return null;
  }

  return (
    <AdPurchaseSuccess
      sessionId={sessionId}
      onClose={() => setShowSuccess(false)}
    />
  );
}
