import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Get Help & Support",
  description:
    "Have a question about Freecoino? Contact our support team via email. We typically respond within 24 hours.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
