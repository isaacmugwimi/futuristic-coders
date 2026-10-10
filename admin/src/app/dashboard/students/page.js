import ModulePage from "@/src/components/ModulePage/ModulePage";
import { Users } from "lucide-react";

export default function StudentsPage() {
  return (
    <ModulePage
      icon={Users}
      title="Students"
      description="Track each learner's progress and performance across programs."
      actionLabel="Add student"
    />
  );
}
