import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { deleteMobilePushToken, registerMobilePushToken } from "@/features/notifications/api";

type NotificationsContextValue = {
  expoPushToken: string | null;
  permissionsStatus: Notifications.PermissionStatus | null;
  isDeviceSupported: boolean;
  isRegistering: boolean;
  requestPermissions: () => Promise<Notifications.PermissionStatus>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function NotificationsProvider({ children }: PropsWithChildren) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionsStatus, setPermissionsStatus] = useState<Notifications.PermissionStatus | null>(
    null
  );
  const [isDeviceSupported, setIsDeviceSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(true);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  useEffect(() => {
    if (Device.isDevice) {
      setIsDeviceSupported(true);
    } else {
      setIsDeviceSupported(false);
      console.warn("[notifications] Push notifications are not supported on simulators.");
    }
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(({ status, token }) => {
        setPermissionsStatus(status);
        setExpoPushToken(token);
      })
      .finally(() => setIsRegistering(false));
  }, []);

  useEffect(() => {
    setDeviceName(Device.deviceName ?? Device.modelName ?? null);
  }, []);

  useEffect(() => {
    if (!expoPushToken) {
      return;
    }

    registerMobilePushToken({ token: expoPushToken, deviceName }).catch((error) => {
      console.error("[notifications] Failed to register push token", error);
    });
  }, [expoPushToken, deviceName]);

  useEffect(() => {
    if (permissionsStatus === Notifications.PermissionStatus.DENIED && expoPushToken) {
      deleteMobilePushToken(expoPushToken).catch((error) => {
        console.error("[notifications] Failed to revoke push token", error);
      });
      setExpoPushToken(null);
    }
  }, [permissionsStatus, expoPushToken]);

  const requestPermissions = useCallback(async () => {
    setIsRegistering(true);
    const result = await registerForPushNotificationsAsync();
    setPermissionsStatus(result.status);
    setExpoPushToken(result.token);
    setIsRegistering(false);
    return result.status;
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      expoPushToken,
      permissionsStatus,
      isDeviceSupported,
      isRegistering,
      requestPermissions,
    }),
    [expoPushToken, permissionsStatus, isDeviceSupported, isRegistering, requestPermissions]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }

  return context;
}

type RegistrationResult = {
  status: Notifications.PermissionStatus;
  token: string | null;
};

async function registerForPushNotificationsAsync(): Promise<RegistrationResult> {
  try {
    if (!Device.isDevice) {
      return {
        status: Notifications.PermissionStatus.UNDETERMINED,
        token: null,
      };
    }

    const permissions = await Notifications.getPermissionsAsync();
    let finalStatus = permissions.status;

    if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
      const request = await Notifications.requestPermissionsAsync();
      finalStatus = request.status;
    }

    if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
      return { status: finalStatus, token: null };
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId ?? undefined;
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);

    return { status: finalStatus, token: token.data };
  } catch (error) {
    console.error("[notifications] Failed to register for push notifications", error);
    return { status: Notifications.PermissionStatus.DENIED, token: null };
  }
}
