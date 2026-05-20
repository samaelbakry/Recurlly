import {isClerkAPIResponseError, useSignIn} from "@clerk/expo";
import {type Href, Link, useRouter} from "expo-router";
import React, {useMemo, useState} from "react";
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
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import {clsx} from "clsx";

const SafeAreaView = styled(RNSafeAreaView);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanMessage(message?: string) {
    return (message || "We could not complete that request. Check your details and try again.")
        .replace(/clerk/gi, "Recurly");
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
            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
                Sign in to continue managing subscriptions, renewals, and spend.
            </Text>
        </View>
    );
}

export default function Signin() {
    const {signIn, errors, fetchStatus} = useSignIn();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [localError, setLocalError] = useState("");
    const [flowMessage, setFlowMessage] = useState("");
    const [awaitingEmailCode, setAwaitingEmailCode] = useState(false);

    const email = emailAddress.trim().toLowerCase();
    const isFetching = fetchStatus === "fetching";
    const isVerificationStep = signIn.status === "needs_client_trust" || awaitingEmailCode;

    const fieldErrors = useMemo(() => {
        return {
            email: !emailAddress ? "" : EMAIL_PATTERN.test(email) ? "" : "Enter a valid email address.",
            password: !password ? "" : password.length >= 8 ? "" : "Use at least 8 characters.",
            code: !code ? "" : /^\d{6}$/.test(code) ? "" : "Enter the 6-digit code.",
        };
    }, [code, email, emailAddress, password]);

    const canSubmit = EMAIL_PATTERN.test(email) && password.length >= 8 && !isFetching;
    const canVerify = /^\d{6}$/.test(code) && !isFetching;

    const completeSignIn = async () => {
        await signIn.finalize({
            navigate: ({session, decorateUrl}) => {
                if (session?.currentTask) {
                    setFlowMessage("One more account step is required before your dashboard opens.");
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
    };

    const sendEmailCodeIfAvailable = async () => {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
            (factor) => factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
            await signIn.mfa.sendEmailCode();
            setAwaitingEmailCode(true);
            setFlowMessage("We sent a verification code to your email.");
        } else {
            setFlowMessage("Use your configured verification method to continue.");
        }
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setLocalError("");
        setFlowMessage("");

        try {
            const {error} = await signIn.password({
                emailAddress: email,
                password,
            });

            if (error) {
                setLocalError(cleanMessage(error.message));
                return;
            }

            if (signIn.status === "complete") {
                await completeSignIn();
                return;
            }

            if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
                await sendEmailCodeIfAvailable();
                return;
            }

            setLocalError("We need a little more information before opening your dashboard.");
        } catch (error) {
            const message = isClerkAPIResponseError(error)
                ? error.errors[0]?.longMessage || error.errors[0]?.message
                : undefined;
            setLocalError(cleanMessage(message));
        }
    };

    const handleVerify = async () => {
        if (!canVerify) return;

        setLocalError("");

        try {
            await signIn.mfa.verifyEmailCode({code});

            if (signIn.status === "complete") {
                await completeSignIn();
                return;
            }

            setLocalError("That code was accepted, but another step is still required.");
        } catch (error) {
            const message = isClerkAPIResponseError(error)
                ? error.errors[0]?.longMessage || error.errors[0]?.message
                : undefined;
            setLocalError(cleanMessage(message || errors.fields.code?.message));
        }
    };

    const handleReset = () => {
        signIn.reset();
        setCode("");
        setLocalError("");
        setFlowMessage("");
        setAwaitingEmailCode(false);
    };

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
                    <AuthHeader/>

                    <View className="auth-card">
                        {isVerificationStep ? (
                            <View className="auth-form">
                                <View className="auth-field">
                                    <Text className="auth-label">Verification code</Text>
                                    <TextInput
                                        className={clsx("auth-input", (fieldErrors.code || errors.fields.code) && "auth-input-error")}
                                        value={code}
                                        onChangeText={setCode}
                                        placeholder="Enter the code"
                                        placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                        keyboardType="number-pad"
                                        textContentType="oneTimeCode"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                    />
                                    {!!fieldErrors.code && <Text className="auth-error">{fieldErrors.code}</Text>}
                                    {!!flowMessage && <Text className="auth-helper">{flowMessage}</Text>}
                                </View>

                                {!!localError && <Text className="auth-error">{localError}</Text>}

                                <Pressable
                                    className={clsx("auth-button", !canVerify && "auth-button-disabled")}
                                    onPress={handleVerify}
                                    disabled={!canVerify}
                                >
                                    {isFetching ? (
                                        <ActivityIndicator color="#081126"/>
                                    ) : (
                                        <Text className="auth-button-text">Verify and continue</Text>
                                    )}
                                </Pressable>

                                <Pressable
                                    className="auth-secondary-button"
                                    onPress={sendEmailCodeIfAvailable}
                                    disabled={isFetching}
                                >
                                    <Text className="auth-secondary-button-text">Send a new code</Text>
                                </Pressable>

                                <Pressable onPress={handleReset} disabled={isFetching}>
                                    <Text className="auth-link text-center">Use a different email</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View className="auth-form">
                                <View className="auth-field">
                                    <Text className="auth-label">Email</Text>
                                    <TextInput
                                        className={clsx("auth-input", (fieldErrors.email || errors.fields.identifier) && "auth-input-error")}
                                        value={emailAddress}
                                        onChangeText={setEmailAddress}
                                        placeholder="Enter your email"
                                        placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="email-address"
                                        textContentType="emailAddress"
                                        autoComplete="email"
                                    />
                                    {!!fieldErrors.email && <Text className="auth-error">{fieldErrors.email}</Text>}
                                    {!!errors.fields.identifier && (
                                        <Text
                                            className="auth-error">{cleanMessage(errors.fields.identifier.message)}</Text>
                                    )}
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Password</Text>
                                    <TextInput
                                        className={clsx("auth-input", (fieldErrors.password || errors.fields.password) && "auth-input-error")}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Enter your password"
                                        placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                        secureTextEntry
                                        textContentType="password"
                                        autoComplete="password"
                                    />
                                    {!!fieldErrors.password &&
                                        <Text className="auth-error">{fieldErrors.password}</Text>}
                                    {!!errors.fields.password && (
                                        <Text
                                            className="auth-error">{cleanMessage(errors.fields.password.message)}</Text>
                                    )}
                                </View>

                                {!!localError && <Text className="auth-error">{localError}</Text>}

                                <Pressable
                                    className={clsx("auth-button", !canSubmit && "auth-button-disabled")}
                                    onPress={handleSubmit}
                                    disabled={!canSubmit}
                                >
                                    {isFetching ? (
                                        <ActivityIndicator color="#081126"/>
                                    ) : (
                                        <Text className="auth-button-text">Sign in</Text>
                                    )}
                                </Pressable>

                                <View className="auth-divider-row">
                                    <View className="auth-divider-line"/>
                                    <Text className="auth-divider-text">Protected access</Text>
                                    <View className="auth-divider-line"/>
                                </View>

                                <Text className="auth-helper text-center">
                                    Your account keeps subscription data private and synced across devices.
                                </Text>

                                <View className="auth-link-row">
                                    <Text className="auth-link-copy">New to Recurly?</Text>
                                    <Link href="/signUp">
                                        <Text className="auth-link">Create an account</Text>
                                    </Link>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
