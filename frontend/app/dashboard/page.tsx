import PageWrapper from "../../components/PageWrapper";
import Link from "next/link";

export default function Dashboard() {
  return (
    <PageWrapper title="Dashboard">
      <ul>
        <li><Link href="/dashboard/personal-goals">Personal Goals</Link></li>
        <li><Link href="/dashboard/habit-tracking">Habit Tracking</Link></li>
        <li><Link href="/dashboard/progress-reports">Progress Reports</Link></li>
      </ul>
    </PageWrapper>
  );
}
