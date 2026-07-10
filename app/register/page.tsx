import type { Metadata } from "next";
import { RegistrationForm } from "@/features/registration";
import { AuthBackground } from "@/components/auth-background";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <AuthBackground>
      <section className="flex w-full max-w-4xl flex-col border border-border bg-background p-8 sm:p-10 h-[calc(100svh-4rem)] min-h-0">
        <RegistrationForm />
      </section>
    </AuthBackground>
  );
}
