import { ImageResponse } from "next/og";

// Use Node.js runtime for database access
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Dynamic import to avoid bundling issues
    const { prisma } = await import("@/lib/prisma");
    const { fetchStripeMetrics } = await import("@/lib/stripe-client");

    // Fetch startup data directly
    const startup = await prisma.startup.findUnique({
      where: { slug },
      select: {
        name: true,
        logo: true,
        website: true,
        apiKey: true,
      },
    });

    if (!startup) {
      return new Response("Startup not found", { status: 404 });
    }

    // Fetch metrics
    const metrics = await fetchStripeMetrics(startup.apiKey);

    // Format revenue
    const formatRevenue = (amount: number, currency: string) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const totalRevenue = metrics?.totalRevenue || 0;
    const mrr = metrics?.monthlyRecurringRevenue || 0;
    const currency = metrics?.currency || "USD";

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
          {/* Header with logo and name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
            }}
          >
            {startup.logo && (
              <img
                src={startup.logo}
                alt={startup.name}
                width={120}
                height={120}
                style={{
                  borderRadius: "20px",
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
                {startup.name}
              </h1>
              {startup.website && (
                <p
                  style={{
                    fontSize: "28px",
                    color: "#71717a",
                    margin: 0,
                  }}
                >
                  {startup.website.replace(/^https?:\/\//, "")}
                </p>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div
            style={{
              display: "flex",
              gap: "60px",
              marginTop: "20px",
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
                Monthly Recurring Revenue
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
