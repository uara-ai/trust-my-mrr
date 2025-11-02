import Link from "next/link";

export function ProductHunt() {
  return (
    <Link
      href="https://www.producthunt.com/products/trust-my-mrr?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-trust&#0045;my&#0045;mrr"
      target="_blank"
    >
      <img
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1033536&theme=neutral&t=1762070034493"
        alt="Trust&#0032;My&#0032;MRR - Prove&#0032;your&#0032;MRR&#0044;&#0032;not&#0032;your&#0032;faith&#0032;—&#0032;the&#0032;open&#0045;source&#0032;TrustMRR&#0046; | Product Hunt"
        style={{ width: "250px", height: "54px" }}
        width="250"
        height="54"
      />
    </Link>
  );
}
