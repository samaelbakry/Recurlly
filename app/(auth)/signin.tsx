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
    const [localError, setLocalError] = useState("");

    const email = emailAddress.trim().toLowerCase();
    const isFetching = fetchStatus === "fetching";

    const fieldErrors = useMemo(() => {
        return {
            email: !emailAddress ? "" : EMAIL_PATTERN.test(email) ? "" : "Enter a valid email address.",
            password: !password ? "" : password.length >= 8 ? "" : "Use at least 8 characters.",
        };
    }, [email, emailAddress, password]);

    const canSubmit = EMAIL_PATTERN.test(email) && password.length >= 8 && !isFetching;

    const completeSignIn = async () => {
        await signIn.finalize({
            navigate: ({session, decorateUrl}) => {
                if (session?.currentTask) {
                    setLocalError("One more account step is required before your dashboard opens.");
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

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setLocalError("");

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

            setLocalError("This account requires another sign-in step. Disable MFA in Clerk to use email and password only.");
        } catch (error) {
            const message = isClerkAPIResponseError(error)
                ? error.errors[0]?.longMessage || error.errors[0]?.message
                : undefined;
            setLocalError(cleanMessage(message));
        }
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
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
