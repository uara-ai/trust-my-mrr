"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AdPurchaseSuccess } from "./ad-purchase-success";

export function AdPurchaseSuccessWrapper() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [spotId, setSpotId] = useState<string | null>(null);
  const [priceId, setPriceId] = useState<string | null>(null);

  useEffect(() => {
    const adPurchase = searchParams.get("ad_purchase");
    const session = searchParams.get("session_id");
    const spot = searchParams.get("spot_id");
    const price = searchParams.get("price_id");

    if (adPurchase === "success" && session) {
      setSessionId(session);
      setSpotId(spot);
      setPriceId(price);
      setShowSuccess(true);
    }
  }, [searchParams]);

  if (!showSuccess || !sessionId) {
    return null;
  }

  return (
    <AdPurchaseSuccess
      sessionId={sessionId}
      spotId={spotId}
      priceId={priceId}
      onClose={() => setShowSuccess(false)}
    />
  );
}
