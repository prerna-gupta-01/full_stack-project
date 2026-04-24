"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  studentId: z.string().min(3, "Student ID must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.fullName,
        // @ts-ignore
        studentId: data.studentId,
      });

      if (authError) {
        setError(authError.message || "An error occurred during signup");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 border-none shadow-xl rounded-2xl bg-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">Join CampusFind today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" type="text" {...register("fullName")} className="mt-1" placeholder="John Doe" />
            {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" {...register("email")} className="mt-1" placeholder="you@campus.com" />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="studentId">Student ID</Label>
            <Input id="studentId" type="text" {...register("studentId")} className="mt-1" placeholder="STU12345" />
            {errors.studentId && <p className="text-sm text-red-500 mt-1">{errors.studentId.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} className="mt-1" placeholder="••••••••" />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
