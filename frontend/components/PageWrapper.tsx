import { ReactNode } from "react";

interface PageWrapperProps {
  title: string;
  children?: ReactNode;
}

export default function PageWrapper({ title, children }: PageWrapperProps) {
  return (
    <div>
      <h1>{title}</h1>
      <div style={{ marginTop: "15px" }}>{children}</div>
    </div>
  );
}
