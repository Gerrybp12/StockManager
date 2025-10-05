"use client";

import { useEffect, useState, useCallback } from "react"; // Import useCallback
import { createClient } from "@/utils/supabase/client";
import { getProfile } from "@/app/login/actions";
import { useNavigation } from "@/hooks/useNavigation";
import { User, Mail, Shield, LogOut } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { FloatingBackButton } from "@/components/ui/floating-buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "@/types/user";

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const supabase = createClient();
  const { navigateTo, isLoading, isAnyLoading } = useNavigation();

  // Wrap loadProfile in useCallback
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setGlobalError(null);

      const result = await getProfile();

      if (result.error) {
        setGlobalError(result.error);
        if (result.error === 'User not authenticated') {
          navigateTo("/login", "login");
        }
        return;
      }

      setUser(result.user);
      setProfile(result.profile);
    } catch (error) {
      console.error("Error loading profile:", error);
      setGlobalError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [navigateTo]); // navigateTo is a dependency of loadProfile

  useEffect(() => {
    loadProfile();
  }, []); // Now include loadProfile in the dependency array

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      navigateTo("/login", "logout");
    } catch (error) {
      console.error("Error signing out:", error);
      setGlobalError("Failed to sign out");
    }
  }

  function getRoleBadgeVariant(role: string) {
    switch (role.toLowerCase()) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      case "tiktok":
      case "shopee":
      case "toko":
        return "secondary";
      default:
        return "outline";
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Floating Back Button */}
      <FloatingBackButton
        disabled={isAnyLoading}
      />

      <div className="max-w-2xl mx-auto pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account information
          </p>
        </div>

        {/* Error Alert */}
        {globalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              <span>{globalError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadProfile}
                className="ml-4"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        {profile && user ? (
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">
                {profile.username}
              </CardTitle>
              <CardDescription className="text-base">
                Account information and settings
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Email */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">{profile.email}</span>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Account Role
                </label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <Badge
                    variant={getRoleBadgeVariant(profile.role)}
                    className="capitalize text-sm px-3 py-1"
                  >
                    {profile.role}
                  </Badge>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Logout Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Account Actions
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sign out of your account to secure your session.
                </p>

                <Button
                  onClick={signOut}
                  disabled={isLoading("logout")}
                  variant="destructive"
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {isLoading("logout") ? "Logging out..." : "Sign Out"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Profile Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Unable to load your profile information.
                </p>
                <Button
                  onClick={loadProfile}
                  variant="outline"
                  className="px-6"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}