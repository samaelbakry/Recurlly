import { useAuth, useSignUp } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp } = useSignUp();

  if (!isLoaded) return null;

  const isPendingVerification =
    signUp?.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address");

  if (isSignedIn && !isPendingVerification) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}