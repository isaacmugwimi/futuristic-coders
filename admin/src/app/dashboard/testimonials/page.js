// admin/src/app/(dashboard)/testimonials/page.js
// Server component: it only sets metadata and renders the client component.

import Testimonial from "@/src/components/Testimonial/Testimonial";

export const metadata = {
  title: "Testimonials | Futuristic Coders Admin",
  description: "Review, approve, and publish parent and student testimonials.",
  robots: { index: false, follow: false },
};

export default function TestimonialsPage() {
  return <Testimonial />;
}
