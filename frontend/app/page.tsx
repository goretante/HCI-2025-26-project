import PageWrapper from "../components/PageWrapper";
import Link from "next/link";

export default function Home() {
  return (
    <PageWrapper title="Homepage">
      <ul>
        <li><Link href="/login">Login / Register</Link></li>
        <li><Link href="/blog">Blog</Link></li>
        <li><Link href="/dashboard">Dashboard</Link></li>
      </ul>
    </PageWrapper>
  );
}
