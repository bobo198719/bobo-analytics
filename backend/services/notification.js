const webpush = require("web-push");

// These should be in .env
const vapidPublic = process.env.VAPID_PUBLIC || "BPR_placeholder_public_key";
const vapidPrivate = process.env.VAPID_PRIVATE || "BPR_placeholder_private_key";

webpush.setVapidDetails(
    "mailto:admin@boboanalytics.com",
    vapidPublic,
    vapidPrivate
);

module.exports.send = async function(subscription, message) {
    try {
        await webpush.sendNotification(subscription, JSON.stringify({
            title: "New Cake Update 🎂",
            body: message
        }));
        return { success: true };
    } catch (err) {
        console.error("Push Notification Error:", err);
        return { success: false, error: err.message };
    }
};
