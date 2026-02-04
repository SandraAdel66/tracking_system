"use client";

import Image from "next/image";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { User, Key } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthenticationForm() {
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen">
      {/* Image */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/login.jpg"
          alt="Logistics Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-20 left-10 right-10 z-10">
          <p className="text-white text-center text-2xl font-normal">
            Streamline your logistics operations with real-time tracking and
            comprehensive fleet management.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <form className="flex w-full max-w-sm flex-col gap-4">
          <h3 className="text-[32px] font-bold text-center text-[#37384e]">
            Welcome Back
          </h3>

          <p className="text-[16px] font-medium text-center text-[#9aa0b3]">
            Enter your credentials to access your dashboard
          </p>
          <label className="text-sm font-medium text-[#37384e]">Email</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aa0b3]" />
            <Input
              type="email"
              placeholder="Email"
              required
              className="h-12 pl-10"
            />
          </div>
          <label className="text-sm font-medium text-[#37384e]">Password</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aa0b3]" />
            <Input
              type="password"
              placeholder="Password"
              required
              className="h-12 pl-10"
            />
          </div>

          <span className="flex justify-end text-[14px] font-medium text-[#f26d21] cursor-pointer">
            Forgot Password?
          </span>

          <Button
            type="submit"
            className="mt-4 bg-[#f26d21] hover:bg-[#f26d21]/60 font-bold text-xl"
            size="xl"
            onClick={handleSubmit}
          >
            Log In
          </Button>

          <p className="text-center text-[14px] font-medium text-[#9aa0b3]">
            Do not have an account?{" "}
            <span className="text-[#f26d21] cursor-pointer">Request Access</span>
          </p>
        </form>
      </div>
    </div>
  );
}
