"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useNavigation } from "@/hooks/useNavigation";
import { ArrowLeft, User, Mail, Shield, LogOut } from "lucide-react";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
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

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const supabase = createClient();
  const { navigateTo, isLoading } = useNavigation();

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      setGlobalError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigateTo("/login", "login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, username, email, role")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      setGlobalError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

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

  function handleBack() {
    navigateTo("/", "back");
  }

  function getRoleBadgeVariant(role: string) {
    switch (role.toLowerCase()) {
      case "admin":
        return "destructive";
      case "moderator":
        return "secondary";
      default:
        return "default";
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Error Alert */}
        {globalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              <span>{globalError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={getProfile}
                className="ml-4"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        {profile ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Details
              </CardTitle>
              <CardDescription>
                Your personal information and account settings
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Username
                </label>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{profile.username}</span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email Address
                </label>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{profile.email}</span>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Account Role
                </label>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Badge
                    variant={getRoleBadgeVariant(profile.role)}
                    className="capitalize"
                  >
                    {profile.role}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Actions</h3>

                <Button
                  onClick={signOut}
                  disabled={isLoading("logout")}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoading("logout") ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No profile found</p>
                <Button onClick={getProfile} variant="outline" className="mt-4">
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
