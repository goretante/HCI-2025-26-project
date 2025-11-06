import PageWrapper from "../../../components/PageWrapper";
import Link from "next/link";

export default function HabitTrackingPage() {
  return (
    <PageWrapper title="Habit Tracking">
      <ul>
        <li>
          <Link href="/dashboard/habit-tracking/create">Add a New Habit</Link>
        </li>
        <li>
          <Link href="/dashboard/habit-tracking/manage">Manage Your Habits</Link>
        </li>
      </ul>
    </PageWrapper>
  );
}
