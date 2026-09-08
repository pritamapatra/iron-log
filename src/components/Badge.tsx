import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  type: "strength" | "cardio";
}

export default function Badge({ children, type }: BadgeProps) {
  const styles = {
    strength: "bg-tag-strength/10 text-tag-strength",
    cardio: "bg-tag-cardio/10 text-tag-cardio",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-xs py-[2px] text-label font-medium ${styles[type]}`}
    >
      {children}
    </span>
  );
}
