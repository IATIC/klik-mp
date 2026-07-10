import type { Metadata } from "next";
import { LoginForm } from "@/features/registration";
import { AuthBackground } from "@/components/auth-background";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <AuthBackground>
      <section className="w-full max-w-2xl border border-border bg-background p-8">
        <LoginForm />
      </section>
    </AuthBackground>
  );
}
