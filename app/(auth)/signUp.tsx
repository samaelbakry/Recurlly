import { isClerkAPIResponseError, useSignUp } from "@clerk/expo";
import { clsx } from "clsx";
import { Link, Redirect, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_PASSWORD_FIELDS = new Set(["email_address", "password"]);

function cleanMessage(message?: string) {
  return (
    message ||
    "We could not complete that request. Check your details and try again."
  ).replace(/clerk/gi, "Recurly");
}

function AuthHeader() {
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

      <Text className="auth-title">Create account</Text>
      <Text className="auth-subtitle">
        Start tracking renewals with a secure workspace built for subscription
        control.
      </Text>
    </View>
  );
}

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const email = emailAddress.trim().toLowerCase();
  const isFetching = fetchStatus === "fetching";

  const fieldErrors = useMemo(() => {
    return {
      email: !emailAddress
        ? ""
        : EMAIL_PATTERN.test(email)
          ? ""
          : "Enter a valid email address.",
      password: !password
        ? ""
        : password.length >= 8
          ? ""
          : "Use at least 8 characters.",
    };
  }, [email, emailAddress, password]);

  const canSubmit =
    EMAIL_PATTERN.test(email) && password.length >= 8 && !isFetching;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLocalError("");

    try {
      const unsupportedRequiredFields = signUp.requiredFields.filter(
        (field) => !EMAIL_PASSWORD_FIELDS.has(field),
      );

      if (unsupportedRequiredFields.length > 0) {
        setLocalError(
          `This Clerk project still requires ${unsupportedRequiredFields.join(
            ", ",
          )}. Disable those requirements in Clerk to use email and password only.`,
        );
        return;
      }

      const createResult = await signUp.password({
        emailAddress: email,
        password,
      });

      if (createResult.error) {
        setLocalError(cleanMessage(createResult.error.message));
        return;
      }

      const codeResult = await signUp.verifications.sendEmailCode();

      if (codeResult.error) {
        setLocalError(cleanMessage(codeResult.error.message));
        return;
      }

      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      const message = isClerkAPIResponseError(error)
        ? error.errors[0]?.longMessage || error.errors[0]?.message
        : undefined;
      setLocalError(cleanMessage(message));
    }
  };

  if (signUp.status === "complete") {
    return <Redirect href="/" />;
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
          <AuthHeader />

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    (fieldErrors.email || errors.fields.emailAddress) &&
                      "auth-input-error",
                  )}
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0,0,0,.45)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                />

                {!!fieldErrors.email && (
                  <Text className="auth-error">{fieldErrors.email}</Text>
                )}

                {!!errors.fields.emailAddress && (
                  <Text className="auth-error">
                    {cleanMessage(errors.fields.emailAddress.message)}
                  </Text>
                )}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Password</Text>

                <TextInput
                  className={clsx(
                    "auth-input",
                    (fieldErrors.password || errors.fields.password) &&
                      "auth-input-error",
                  )}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor="rgba(0,0,0,.45)"
                  secureTextEntry
                  textContentType="newPassword"
                  autoComplete="new-password"
                />

                {!!fieldErrors.password && (
                  <Text className="auth-error">{fieldErrors.password}</Text>
                )}

                {!!errors.fields.password && (
                  <Text className="auth-error">
                    {cleanMessage(errors.fields.password.message)}
                  </Text>
                )}

                <Text className="auth-helper">
                  Use 8+ characters for stronger security.
                </Text>
              </View>

              {!!localError && <Text className="auth-error">{localError}</Text>}

              <Pressable
                className={clsx(
                  "auth-button",
                  !canSubmit && "auth-button-disabled",
                )}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                {isFetching ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Create account</Text>
                )}
              </Pressable>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/signin">
                  <Text className="auth-link">Sign in</Text>
                </Link>
              </View>

              <View nativeID="clerk-captcha" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
