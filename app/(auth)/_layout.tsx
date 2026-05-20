import { useAuth, useSignUp } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp } = useSignUp();

  if (!isLoaded) return null;

  if (signUp?.status == null) {
    return null;
  }

  const waitingVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address") &&
    signUp.missingFields?.length === 0;

  const hasPendingTask = signUp.status === "complete";

  if (isSignedIn && !waitingVerification && !hasPendingTask) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}