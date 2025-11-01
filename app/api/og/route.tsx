import { ImageResponse } from "next/og";

export async function GET() {
  try {
    // For home page, we'll create a simple, clean OG image
    // showing the Trust My MRR branding and tagline

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            padding: "80px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "40px",
            }}
          >
            <h1
              style={{
                fontSize: "80px",
                fontWeight: "bold",
                color: "#09090b",
                textAlign: "center",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Trust My MRR
            </h1>
            <p
              style={{
                fontSize: "36px",
                color: "#71717a",
                textAlign: "center",
                margin: 0,
                maxWidth: "800px",
              }}
            >
              Transparent Startup Revenue Tracking
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginTop: "40px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  color: "#52525b",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                📊 Real-time Stripe Data
              </div>
              <div
                style={{
                  fontSize: "28px",
                  color: "#52525b",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                💰 Compare Startup Revenues
              </div>
              <div
                style={{
                  fontSize: "28px",
                  color: "#52525b",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                🚀 Track Founder Success
              </div>
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
