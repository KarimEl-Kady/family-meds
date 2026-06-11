import * as Notifications from "expo-notifications";

export async function registerNotifications() {
  const { status } =
    await Notifications.requestPermissionsAsync();

  if (status !== "granted") {
    console.log("Notification permission denied");
    return false;
  }

  return true;
}