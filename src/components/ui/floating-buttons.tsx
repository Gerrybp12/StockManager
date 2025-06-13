// components/ui/floating-buttons.tsx
"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";

interface FloatingBackButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface FloatingProfileButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function FloatingBackButton({ 
  onClick, 
  disabled = false, 
  className = "" 
}: FloatingBackButtonProps) {
  const { navigateBack, isAnyLoading } = useNavigation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigateBack();
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className={`fixed top-6 left-6 z-40 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/90 backdrop-blur-sm border-2 hover:bg-white ${className}`}
      onClick={handleClick}
      disabled={disabled || isAnyLoading}
    >
      <ArrowLeft className="h-6 w-6" />
    </Button>
  );
}

export function FloatingProfileButton({ 
  onClick, 
  disabled = false, 
  className = "" 
}: FloatingProfileButtonProps) {
  const { navigateTo, isAnyLoading } = useNavigation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigateTo("/profile", "profile");
    }
  };

  return (
    <Button
      size="lg"
      className={`fixed top-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
      onClick={handleClick}
      disabled={disabled || isAnyLoading}
    >
      <User className="h-6 w-6" />
    </Button>
  );
}

// Optional: Combined component for pages that need both
interface FloatingNavigationProps {
  showBack?: boolean;
  showProfile?: boolean;
  onBackClick?: () => void;
  onProfileClick?: () => void;
  disabled?: boolean;
}

export function FloatingNavigation({
  showBack = true,
  showProfile = true,
  onBackClick,
  onProfileClick,
  disabled = false
}: FloatingNavigationProps) {
  return (
    <>
      {showBack && (
        <FloatingBackButton 
          onClick={onBackClick} 
          disabled={disabled} 
        />
      )}
      {showProfile && (
        <FloatingProfileButton 
          onClick={onProfileClick} 
          disabled={disabled} 
        />
      )}
    </>
  );
}