"use client";

import { UserProfileProvider } from "../../../app/hooks/useUserProfile";
import { MyListProvider } from "../../../app/hooks/useMyList";
import { FavoritesProvider } from "../../../app/hooks/useFavorites";
import { AuthModalProvider } from "../../../app/hooks/useAuthModal";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProfileProvider>
      <MyListProvider>
        <FavoritesProvider>
          <AuthModalProvider>{children}</AuthModalProvider>
        </FavoritesProvider>
      </MyListProvider>
    </UserProfileProvider>
  );
}
