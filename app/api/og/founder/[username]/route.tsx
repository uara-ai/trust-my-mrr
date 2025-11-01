import { ImageResponse } from "next/og";

// Use Node.js runtime for database access
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Dynamic import to avoid bundling issues
    const { prisma } = await import("@/lib/prisma");
    const { fetchStripeMetrics } = await import("@/lib/stripe-client");

    // Fetch founder data directly
    const founder = await prisma.founder.findFirst({
      where: {
        x_username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: {
        x_username: true,
        profileImageUrl: true,
        displayName: true,
      },
    });

    if (!founder) {
      return new Response("Founder not found", { status: 404 });
    }

    // Get all startups for this founder
    const startups = await prisma.startup.findMany({
      where: {
        founders: {
          some: {
            x_username: {
              equals: username,
              mode: "insensitive",
            },
          },
        },
      },
      select: {
        apiKey: true,
      },
    });

    // Fetch and aggregate metrics
    let totalRevenue = 0;
    let totalMRR = 0;
    let currency = "USD";

    for (const startup of startups) {
      try {
        const metrics = await fetchStripeMetrics(startup.apiKey);
        if (metrics) {
          totalRevenue += metrics.totalRevenue;
          totalMRR += metrics.monthlyRecurringRevenue;
          if (!currency || currency === "USD") {
            currency = metrics.currency;
          }
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    }

    const aggregatedMetrics = {
      totalRevenue,
      totalMRR,
      startupsCount: startups.length,
      currency: currency.toUpperCase(),
    };

    // Format revenue
    const formatRevenue = (amount: number, curr: string) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: curr || "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    };

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
                  {formatRevenue(
                    aggregatedMetrics.totalRevenue,
                    aggregatedMetrics.currency
                  )}
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
                  {formatRevenue(
                    aggregatedMetrics.totalMRR,
                    aggregatedMetrics.currency
                  )}
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
