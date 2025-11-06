import PageWrapper from "../../../components/PageWrapper";
import Link from "next/link";

export default function PersonalGoalsPage() {
  return (
    <PageWrapper title="Personal Goals">
      <ul>
        <li>
          <Link href="/dashboard/personal-goals/create">Create a New Goal</Link>
        </li>
        <li>
          <Link href="/dashboard/personal-goals/manage">Manage Your Goals</Link>
        </li>
      </ul>
    </PageWrapper>
  );
}
