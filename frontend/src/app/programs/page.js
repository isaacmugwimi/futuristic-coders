// import Programs from "../../components/Programs/Programs";

import Programs from "../../components/ProgramsPage/Programs";

export const metadata = {
  title: "Programs | Futuristic Coders",
  description:
    "Coding programs for kids, teens and adults in Kenya: Scratch, web development, Python, React and more.",
  alternates: { canonical: "/programs" },
};

export default function ProgramsPage() {
  return <Programs />;
}
