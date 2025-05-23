import { EditProblemClient } from "./EditProblemClient";
import { getCourses } from "../../../actions";

export default async function EditProblemPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const problemId = parseInt(id);

  const coursesData = await getCourses();

  return (
    <EditProblemClient 
      problemId={problemId} 
      initialCourses={coursesData}
    />
  );
} 