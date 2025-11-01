import { Suspense } from "react";
import { StartupsPage } from "@/components/startups-page";
import { AdPurchaseSuccessWrapper } from "@/components/ad-purchase-success-wrapper";

export default function Home() {
  return (
    <>
      <StartupsPage />
      <Suspense fallback={null}>
        <AdPurchaseSuccessWrapper />
      </Suspense>
    </>
  );
}
