import dayjs from "dayjs";

export type WeeklySpendingItem = {
    day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
    amount: number;
    index: number;
};

export type UpcomingSubscriptionInsight = UpcomingSubscription & {
    renewalDate?: string;
};

export const chartDays: WeeklySpendingItem["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const isBillableSubscription = (subscription: Subscription) => {
    const status = subscription.status?.toLowerCase();
    return status !== "cancelled" && status !== "paused";
};

export const normalizeMonthlyPrice = (subscription: Subscription) => {
    const billing = subscription.billing.toLowerCase();

    if (billing.includes("year")) {
        return subscription.price / 12;
    }

    return subscription.price;
};

export const getMonthlyTotal = (subscriptions: Subscription[]) =>
    subscriptions
        .filter(isBillableSubscription)
        .reduce((total, subscription) => total + normalizeMonthlyPrice(subscription), 0);

export const getNextRenewalDate = (subscription: Subscription) => {
    let renewalDate = dayjs(subscription.renewalDate);

    if (!renewalDate.isValid()) {
        return null;
    }

    const billing = subscription.billing.toLowerCase();
    const unit = billing.includes("year") ? "year" : "month";
    const today = dayjs().startOf("day");

    while (renewalDate.startOf("day").isBefore(today)) {
        renewalDate = renewalDate.add(1, unit);
    }

    return renewalDate;
};

export const getDaysUntilRenewal = (renewalDate?: string) => {
    const parsedDate = dayjs(renewalDate);

    if (!parsedDate.isValid()) {
        return 0;
    }

    return Math.max(parsedDate.startOf("day").diff(dayjs().startOf("day"), "day"), 0);
};

export const getUpcomingSubscriptions = (subscriptions: Subscription[], limit?: number): UpcomingSubscriptionInsight[] => {
    const upcomingSubscriptions = subscriptions
        .filter(isBillableSubscription)
        .reduce<UpcomingSubscriptionInsight[]>((items, subscription) => {
            const renewalDate = getNextRenewalDate(subscription);

            if (!renewalDate) {
                return items;
            }

            items.push({
                id: subscription.id,
                icon: subscription.icon,
                name: subscription.name,
                price: subscription.price,
                currency: subscription.currency,
                daysLeft: getDaysUntilRenewal(renewalDate.toISOString()),
                renewalDate: renewalDate.toISOString(),
            });

            return items;
        }, [])
        .sort((left, right) => dayjs(left.renewalDate).valueOf() - dayjs(right.renewalDate).valueOf());

    return typeof limit === "number" ? upcomingSubscriptions.slice(0, limit) : upcomingSubscriptions;
};

export const getWeeklySpending = (subscriptions: Subscription[]): WeeklySpendingItem[] => {
    const totals = chartDays.map((day, index) => ({
        day,
        amount: 0,
        index,
    }));

    subscriptions.filter(isBillableSubscription).forEach((subscription) => {
        const renewalDate = getNextRenewalDate(subscription);

        if (!renewalDate) {
            return;
        }

        const day = renewalDate.day();
        const dayIndex = day === 0 ? 6 : day - 1;
        totals[dayIndex].amount += normalizeMonthlyPrice(subscription);
    });

    return totals;
};
