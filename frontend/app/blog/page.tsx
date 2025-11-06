import PageWrapper from "../../components/PageWrapper";
import Link from "next/link";

const blogPosts = [
  { id: 1, title: "How to Stay Consistent with Your Habits", date: "2025-01-10" },
  { id: 2, title: "Goal Setting Tips for Beginners", date: "2025-01-08" },
  { id: 3, title: "The Science Behind Habit Formation", date: "2025-01-01" },
];

export default function BlogPage() {
  return (
    <PageWrapper title="Blog">
      <ul style={{ paddingLeft: "0", listStyle: "none" }}>
        {blogPosts.map((post) => (
          <li
            key={post.id}
            style={{
              marginBottom: "15px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            <Link href={`/blog/${post.id}`} style={{ fontSize: "18px", fontWeight: "bold" }}>
              {post.title}
            </Link>
            <p style={{ fontSize: "12px", color: "#666" }}>Published: {post.date}</p>
          </li>
        ))}
      </ul>
    </PageWrapper>
  );
}
