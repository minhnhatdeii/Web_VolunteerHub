"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Confirming your email...");

  // Supabase sends these parameters in the confirmation URL
  const type = searchParams.get("type");
  const token = searchParams.get("token");
  const redirect = searchParams.get("redirect_to");

  useEffect(() => {
    // When Supabase handles email confirmation, it will automatically mark the email as confirmed
    // The token and type parameters are sent by Supabase but don't always require additional verification
    if (type === "email" && token) {
      setMessage("Email confirmed successfully!");

      // After a brief delay, redirect user to login or to the redirect URL if provided
      const redirectTimer = setTimeout(() => {
        if (redirect && redirect.includes('localhost')) {
          // If redirect URL is provided and it's to our own site, use it
          window.location.href = redirect;
        } else {
          // Otherwise, route to login
          router.push('/login');
        }
      }, 2000);

      return () => clearTimeout(redirectTimer);
    } else {
      // If no token is present, this page was accessed directly
      setMessage("Welcome to VolunteerHub!");
    }

    // Set loading to false after initial setup
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(loadingTimer);
  }, [type, token, redirect, router]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md card-base p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to VolunteerHub!</h1>
          <p className="text-xl text-muted mb-8">Have a good mood</p>
          <div className="mt-6">
            <p className="text-sm text-muted">
              {message}
            </p>
            {isLoading && (
              <div className="mt-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}