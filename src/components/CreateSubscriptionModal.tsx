import {icons} from "@/constants/icons";
import {clsx} from "clsx";
import dayjs from "dayjs";
import React, {useMemo, useState} from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

type Frequency = "Monthly" | "Yearly";

type CreateSubscriptionModalProps = {
    visible: boolean;
    onClose: () => void;
    onCreate: (subscription: Subscription) => void;
};

const FREQUENCIES: Frequency[] = ["Monthly", "Yearly"];

const CATEGORIES = [
    "Entertainment",
    "AI Tools",
    "Developer Tools",
    "Design",
    "Productivity",
    "Cloud",
    "Music",
    "Other",
] as const;

const CATEGORY_COLORS: Record<(typeof CATEGORIES)[number], string> = {
    Entertainment: "#ffd6a5",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    Design: "#f5c542",
    Productivity: "#b8e8d0",
    Cloud: "#c7e9f1",
    Music: "#d7f7c2",
    Other: "#f0e4c8",
};

const CATEGORY_ICONS: Record<(typeof CATEGORIES)[number], Subscription["icon"]> = {
    Entertainment: icons.netflix,
    "AI Tools": icons.openai,
    "Developer Tools": icons.github,
    Design: icons.figma,
    Productivity: icons.notion,
    Cloud: icons.dropbox,
    Music: icons.spotify,
    Other: icons.wallet,
};

export default function CreateSubscriptionModal({
    visible,
    onClose,
    onCreate,
}: CreateSubscriptionModalProps) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("Monthly");
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Entertainment");

    const numericPrice = Number.parseFloat(price.replace(",", "."));
    const canSubmit = useMemo(() => {
        return name.trim().length > 0 && Number.isFinite(numericPrice) && numericPrice > 0;
    }, [name, numericPrice]);

    const resetForm = () => {
        setName("");
        setPrice("");
        setFrequency("Monthly");
        setCategory("Entertainment");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = () => {
        if (!canSubmit) return;

        const startDate = dayjs();
        const renewalDate = startDate.add(1, frequency === "Monthly" ? "month" : "year");

        onCreate({
            id: `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "subscription"}-${Date.now()}`,
            name: name.trim(),
            price: numericPrice,
            frequency,
            category,
            status: "active",
            startDate: startDate.toISOString(),
            renewalDate: renewalDate.toISOString(),
            icon: CATEGORY_ICONS[category],
            billing: frequency,
            color: CATEGORY_COLORS[category],
            currency: "USD",
        });

        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                className="modal-overlay"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <Pressable className="flex-1" onPress={handleClose}/>
                <View className="modal-container">
                    <View className="modal-header">
                        <Text className="modal-title">New Subscription</Text>
                        <Pressable className="modal-close" onPress={handleClose}>
                            <Text className="modal-close-text">x</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="modal-body">
                            <View className="auth-field">
                                <Text className="auth-label">Name</Text>
                                <TextInput
                                    className="auth-input"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Subscription name"
                                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                    autoCapitalize="words"
                                />
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Price</Text>
                                <TextInput
                                    className="auth-input"
                                    value={price}
                                    onChangeText={setPrice}
                                    placeholder="0.00"
                                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Frequency</Text>
                                <View className="picker-row">
                                    {FREQUENCIES.map((option) => {
                                        const active = frequency === option;

                                        return (
                                            <Pressable
                                                key={option}
                                                className={clsx("picker-option", active && "picker-option-active")}
                                                onPress={() => setFrequency(option)}
                                            >
                                                <Text
                                                    className={clsx(
                                                        "picker-option-text",
                                                        active && "picker-option-text-active",
                                                    )}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Category</Text>
                                <View className="category-scroll">
                                    {CATEGORIES.map((option) => {
                                        const active = category === option;

                                        return (
                                            <Pressable
                                                key={option}
                                                className={clsx("category-chip", active && "category-chip-active")}
                                                onPress={() => setCategory(option)}
                                            >
                                                <Text
                                                    className={clsx(
                                                        "category-chip-text",
                                                        active && "category-chip-text-active",
                                                    )}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            <Pressable
                                className={clsx("auth-button", !canSubmit && "auth-button-disabled")}
                                onPress={handleSubmit}
                                disabled={!canSubmit}
                            >
                                <Text className="auth-button-text">Create Subscription</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
