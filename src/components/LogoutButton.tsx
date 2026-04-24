"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <Button 
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white border-none h-9 px-4"
    >
      Logout
    </Button>
  );
}
