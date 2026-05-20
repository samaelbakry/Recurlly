import { isClerkAPIResponseError, useSignUp } from "@clerk/expo";
import { clsx } from "clsx";
import {
  type Href,
  Link,
  Redirect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { styled } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

function cleanMessage(message?: string) {
  return (
    message ||
    "We could not complete that request. Check your details and try again."
  ).replace(/clerk/gi, "Recurly");
}

function AuthHeader({ email }: { email: string }) {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">R</Text>
        </View>

        <View>
          <Text className="auth-wordmark mb-1">Recurly</Text>
          <Text className="auth-wordmark-sub">Smart billing</Text>
        </View>
      </View>

      <Text className="auth-title">Verify email</Text>
      <Text className="auth-subtitle">
        Enter the code sent to {email || "your email"} to secure your workspace.
      </Text>
    </View>
  );
}

export default function Verify() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");
  const [flowMessage, setFlowMessage] = useState(
    "We sent a verification code to your email."
  );

  const email = typeof params.email === "string" ? params.email : "";

  const isFetching = fetchStatus === "fetching";
  const isSignUpLoading = signUp.status == null;
  const canVerify = /^\d{6}$/.test(code) && !isFetching;

  const hasPendingEmailVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const fieldError = useMemo(() => {
    if (!code) return "";
    return /^\d{6}$/.test(code) ? "" : "Enter the 6-digit code.";
  }, [code]);

  // finish auth flow
  const completeSignUp = useCallback(async () => {
    try {
      const result = await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            setFlowMessage(
              "One more account step is required before your dashboard opens."
            );
            return;
          }

          const url = decorateUrl("/");

          if (Platform.OS === "web" && url.startsWith("http")) {
            window.location.href = url;
            return;
          }

          router.replace(url as Href);
        },
      });

      if (result.error) {
        setLocalError(cleanMessage(result.error.message));
      }
    } catch (error) {
      const message = isClerkAPIResponseError(error)
        ? error.errors[0]?.longMessage || error.errors[0]?.message
        : undefined;

      setLocalError(cleanMessage(message));
    }
  }, [router, signUp]);

  const handleVerify = async () => {
    if (!canVerify) return;

    setLocalError("");
    setFlowMessage("");

    try {
      const verificationResult =
        await signUp.verifications.verifyEmailCode({
          code,
        });

      if (verificationResult.error) {
        setLocalError(
          cleanMessage(verificationResult.error.message)
        );
        return;
      }

      setFlowMessage("Verification complete. Opening dashboard...");

      await completeSignUp();
    } catch (error) {
      const message = isClerkAPIResponseError(error)
        ? error.errors[0]?.longMessage || error.errors[0]?.message
        : undefined;

      setLocalError(
        cleanMessage(
          message || errors.fields.code?.message
        )
      );
    }
  };

  const resendCode = async () => {
    setLocalError("");

    try {
      await signUp.verifications.sendEmailCode();
      setFlowMessage("A fresh code has been sent.");
    } catch (error) {
      const message = isClerkAPIResponseError(error)
        ? error.errors[0]?.longMessage || error.errors[0]?.message
        : undefined;

      setLocalError(cleanMessage(message));
    }
  };

  // Clerk still loading
  if (isSignUpLoading) {
    return null;
  }

  // signup flow missing → back to signup
  if (
    !isSignUpLoading &&
    !hasPendingEmailVerification &&
    signUp.status !== "complete"
  ) {
    return <Redirect href="/signUp" />;
  }

  // already completed
  if (signUp.status === "complete") {
    return null;
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="auth-content"
        >
          <AuthHeader email={email} />

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">
                  Verification code
                </Text>

                <TextInput
                  className={clsx(
                    "auth-input",
                    (fieldError || errors.fields.code) &&
                      "auth-input-error"
                  )}
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter the code"
                  placeholderTextColor="rgba(0,0,0,0.45)"
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                  maxLength={6}
                />

                {!!fieldError && (
                  <Text className="auth-error">
                    {fieldError}
                  </Text>
                )}

                {!!errors.fields.code && (
                  <Text className="auth-error">
                    {cleanMessage(
                      errors.fields.code.message
                    )}
                  </Text>
                )}

                {!!flowMessage && (
                  <Text className="auth-helper">
                    {flowMessage}
                  </Text>
                )}
              </View>

              {!!localError && (
                <Text className="auth-error">
                  {localError}
                </Text>
              )}

              <Pressable
                className={clsx(
                  "auth-button",
                  !canVerify &&
                    "auth-button-disabled"
                )}
                onPress={handleVerify}
                disabled={!canVerify}
              >
                {isFetching ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">
                    Verify and continue
                  </Text>
                )}
              </Pressable>

              <Pressable
                className="auth-secondary-button"
                onPress={resendCode}
                disabled={isFetching}
              >
                <Text className="auth-secondary-button-text">
                  Send a new code
                </Text>
              </Pressable>

              <View className="auth-link-row">
                <Text className="auth-link-copy">
                  Wrong email?
                </Text>

                <Link href="/signUp">
                  <Text className="auth-link">
                    Start over
                  </Text>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}