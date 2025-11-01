import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import {
  getFounderByUsername,
  getFounderAggregatedMetrics,
} from "@/app/actions/founder-detail.actions";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Fetch founder data
    const founderResult = await getFounderByUsername(username);

    if (!founderResult.success || !founderResult.data) {
      return new Response("Founder not found", { status: 404 });
    }

    const founder = founderResult.data;

    // Get aggregated metrics
    const aggregatedMetrics = await getFounderAggregatedMetrics(username);

    // Format revenue
    const formatRevenue = (amount: number, currency: string) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const totalRevenue = aggregatedMetrics.totalRevenue;
    const mrr = aggregatedMetrics.totalMRR;
    const currency = aggregatedMetrics.currency.toUpperCase();

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            padding: "80px",
            gap: "40px",
          }}
        >
          {/* Header with profile image and name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
            }}
          >
            {founder.profileImageUrl && (
              <img
                src={founder.profileImageUrl}
                alt={founder.displayName || founder.x_username}
                width={120}
                height={120}
                style={{
                  borderRadius: "60px",
                  border: "2px solid #e4e4e7",
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <h1
                style={{
                  fontSize: "64px",
                  fontWeight: "bold",
                  color: "#09090b",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {founder.displayName || `@${founder.x_username}`}
              </h1>
              <p
                style={{
                  fontSize: "32px",
                  color: "#71717a",
                  margin: 0,
                }}
              >
                @{founder.x_username}
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "30px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "60px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    color: "#71717a",
                    fontWeight: "500",
                  }}
                >
                  Total Revenue
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#09090b",
                  }}
                >
                  {formatRevenue(totalRevenue, currency)}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    color: "#71717a",
                    fontWeight: "500",
                  }}
                >
                  Total MRR
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#09090b",
                  }}
                >
                  {formatRevenue(mrr, currency)}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "28px",
                color: "#52525b",
              }}
            >
              <span>
                {aggregatedMetrics.startupsCount}{" "}
                {aggregatedMetrics.startupsCount === 1 ? "Startup" : "Startups"}
              </span>
            </div>
          </div>

          {/* Footer branding */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "80px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                color: "#a1a1aa",
              }}
            >
              Trust My MRR
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
