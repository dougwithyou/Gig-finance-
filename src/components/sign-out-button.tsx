"use client";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm">
        Salir
      </Button>
    </form>
  );
}
