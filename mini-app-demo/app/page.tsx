"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  MultiOutlineText
} from "movement-design-system";
import { useEffect, useMemo, useState } from "react";
import { useMovementSDK } from "@movement-labs/miniapp-sdk";

// Removed css() - all styles now use Tailwind classes

// Demo showcasing Movement SDK usage end-to-end for developers.
// Uses the Movement SDK hook for proper TypeScript types.

type TxStatus = { hash: string; status: string; error?: string } | null;

export default function Demo() {
  const { sdk, isConnected, address, isLoading: sdkLoading } = useMovementSDK();
  const isInstalled = !!sdk;
  const isReady = !sdkLoading && !!sdk;

  const [balance, setBalance] = useState<string>("");
  const [network, setNetwork] = useState<string>("");
  const [txStatus, setTxStatus] = useState<TxStatus>(null);
  const [hasFetchedAccount, setHasFetchedAccount] = useState<boolean>(false);
  const [hapticStatus, setHapticStatus] = useState<string>("");
  const [sdkMethods, setSdkMethods] = useState<string[]>([]);
  const [notificationStatus, setNotificationStatus] = useState<string>("");
  const [userInfoStatus, setUserInfoStatus] = useState<string>("");
  const [themeStatus, setThemeStatus] = useState<string>("");
  const [alertStatus, setAlertStatus] = useState<string>("");
  const [confirmStatus, setConfirmStatus] = useState<string>("");
  const [clipboardStatus, setClipboardStatus] = useState<string>("");
  const [balanceStatus, setBalanceStatus] = useState<string>("");
  const [connectStatus, setConnectStatus] = useState<string>("");
  const [signTxStatus, setSignTxStatus] = useState<string>("");
  const [signedTransaction, setSignedTransaction] = useState<any>(null);
  const [submitTxStatus, setSubmitTxStatus] = useState<string>("");
  const [mainButtonStatus, setMainButtonStatus] = useState<string>("");
  const [secondaryButtonStatus, setSecondaryButtonStatus] =
    useState<string>("");
  const [backButtonStatus, setBackButtonStatus] = useState<string>("");
  const [signMessageStatus, setSignMessageStatus] = useState<string>("");
  const [signedMessage, setSignedMessage] = useState<any>(null);
  const [shareStatus, setShareStatus] = useState<string>("");
  const [openUrlStatus, setOpenUrlStatus] = useState<string>("");
  const [storageStatus, setStorageStatus] = useState<string>("");
  const [storageKey, setStorageKey] = useState<string>("");
  const [storageValue, setStorageValue] = useState<string>("");
  const [allStorageItems, setAllStorageItems] = useState<{ key: string; value: string }[]>([]);
  const [cameraStatus, setCameraStatus] = useState<string>("");
  const [cameraImageUri, setCameraImageUri] = useState<string>("");
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [watchLocationStatus, setWatchLocationStatus] = useState<string>("");
  const [watchedLocation, setWatchedLocation] = useState<any>(null);
  const [locationWatchId, setLocationWatchId] = useState<string | null>(null);
  const [locationClearWatch, setLocationClearWatch] = useState<(() => void) | null>(null);

  // Enumerate available SDK methods for the demo UI
  useEffect(() => {
    if (sdk) {
      const methods = Object.getOwnPropertyNames(sdk).filter(
        (name) =>
          typeof (sdk as any)[name] === "function" ||
          typeof (sdk as any)[name] === "object",
      );
      setSdkMethods(methods);
      console.log("Available SDK methods:", methods);
      if (sdk.network) setNetwork(sdk.network as string);
    }
  }, [sdk]);

  // Deliberately avoid auto-fetching account/balance so the manual "Get Account" flow is visible.

  // getUserInfo(): one-shot read of connection/address without subscribing
  const fetchUserInfo = async () => {
    setUserInfoStatus("Calling getUserInfo...");

    if (!sdk) {
      setUserInfoStatus("❌ SDK not available");
      return;
    }

    if (!(sdk as any).getUserInfo) {
      setUserInfoStatus(
        "❌ getUserInfo method not available. Available methods: " +
        Object.getOwnPropertyNames(sdk).join(", "),
      );
      return;
    }

    try {
      const info = await (sdk as any).getUserInfo();

      if (info) {
        // Show just the raw result
        const infoDetails = JSON.stringify(info, null, 2);
        setUserInfoStatus(`✅ getUserInfo result:\n${infoDetails}`);
      } else {
        setUserInfoStatus("⚠️ getUserInfo returned null/undefined");
      }
    } catch (e) {
      setUserInfoStatus(
        `❌ getUserInfo failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  };

  // Connection is controlled by the host wallet. Mini apps do not initiate/disconnect.
  // Use getAccount/getUserInfo or wallet change events to read connection state.

  // sendTransaction(): sign and submit a transaction via host wallet
  const handleSendTx = async () => {
    if (!sdk || !isConnected) return;
    try {
      await sdk.ready?.();
      if (!address) throw new Error("No address available");
      const result = await sdk.sendTransaction({
        function: "0x1::coin::transfer",
        arguments: [
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          "1",
        ],
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        title: "Demo Transfer",
        description: "Send 1 Octa to 0x…01",
      });
      if (result?.hash) {
        // Show hash immediately
        setTxStatus({ hash: result.hash, status: "pending" });

        // Prefer real-time updates when available
        if (typeof sdk.onTransactionUpdate === "function") {
          const unsubscribe = sdk.onTransactionUpdate(
            result.hash,
            (update: any) => {
              if (update?.status) {
                setTxStatus({
                  hash: result.hash,
                  status: update.status,
                  error: update?.error,
                });
                if (update.status === "success" || update.status === "failed") {
                  try {
                    unsubscribe?.();
                  } catch { }
                  sdk.haptic?.({
                    type: "notification",
                    style: update.status === "success" ? "success" : "error",
                  });

                  // Show back button after transaction completes
                  if (update.status === "success") {
                    showBackButtonAfterTransaction(result.hash);
                  }
                }
              }
            },
          );
        } else {
          const status = await sdk.waitForTransaction(result.hash);
          setTxStatus(status);
          await sdk.haptic?.({
            type: "notification",
            style: status.status === "success" ? "success" : "error",
          });

          // Show back button after successful transaction
          if (status.status === "success") {
            showBackButtonAfterTransaction(result.hash);
          }
        }
      } else {
        setTxStatus({ hash: "", status: "failed", error: "No hash returned" });
      }
    } catch (e: any) {
      const code = e?.code || "";
      const msg =
        code === "USER_REJECTED"
          ? "User rejected transaction"
          : e?.message || "Transaction failed";
      setTxStatus({ hash: "", status: "failed", error: msg });
      await sdk.haptic?.({ type: "notification", style: "error" });
    }
  };

  // BackButton: show overlay after successful transaction to return to app
  const showBackButtonAfterTransaction = (txHash: string) => {
    if (!sdk?.BackButton) return;

    const backButton = sdk.BackButton;

    // Show back button in host app
    backButton.show();
    backButton.onClick(() => {
      // Hide the back button
      backButton.hide();

      // Navigate back to mini-app (this would be handled by the host app)
      // The host app should detect this and return to the mini-app
      console.log("Back button clicked - returning to mini-app");

      // Optional: Show a notification
      sdk.notify?.({
        title: "Returned to Mini App",
        body: "You're back in the mini-app!",
      });
    });

    // Auto-hide back button after 30 seconds
    setTimeout(() => {
      backButton.hide();
    }, 30000);
  };

  // scanQRCode(): open device camera and return scanned data
  const handleScan = async () => {
    if (!sdk) return;
    try {
      const scanned = await sdk.scanQRCode?.();
      await sdk.notify?.({ title: "Scanned", body: scanned || "" });
    } catch (e) {
      console.warn(e);
    }
  };

  // haptic(): device vibration feedback (mobile only)
  const handleHaptic = async (
    type: "impact" | "notification" | "selection",
    style?:
      | "light"
      | "medium"
      | "heavy"
      | "rigid"
      | "soft"
      | "success"
      | "warning"
      | "error",
  ) => {
    setHapticStatus(`Testing ${type}${style ? ` (${style})` : ""} haptic...`);

    if (!sdk) {
      setHapticStatus("❌ SDK not available");
      return;
    }

    if (!sdk.haptic) {
      setHapticStatus(
        `❌ Haptic method not available on SDK\n\nAvailable methods: ${Object.getOwnPropertyNames(
          sdk,
        ).join(", ")}`,
      );
      return;
    }

    try {
      const options = style ? { type, style } : { type };
      const result = await sdk.haptic(options as any);
      setHapticStatus(
        `✅ ${type}${style ? ` (${style})` : ""
        } haptic sent successfully!\n\nResult: ${JSON.stringify(result)}`,
      );
    } catch (error) {
      setHapticStatus(
        `❌ Haptic execution failed: ${(error as Error).message || error}`,
      );
    }
  };

  // showPopup(): native popup with custom buttons, returns selected button id
  const handlePopup = async () => {
    if (!sdk) return;
    try {
      const result = await sdk.showPopup?.({
        title: "Confirm Action",
        message: "Proceed with demo?",
        buttons: [
          { id: "yes", text: "Yes", type: "default" },
          { id: "no", text: "No", type: "cancel" },
        ],
      });
      await sdk.notify?.({
        title: "Popup",
        body: `Selected: ${result?.button_id || "none"}`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // storage.get/set/remove(): local device storage scoped to the mini app
  const handleStorage = async () => {
    if (!sdk?.CloudStorage) return;
    try {
      await sdk.CloudStorage.setItem("demo_key", "demo_value");
      const val = await sdk.CloudStorage.getItem("demo_key");
      await sdk.notify?.({ title: "CloudStorage", body: `demo_key=${val}` });
      await sdk.CloudStorage.removeItem("demo_key");
    } catch (e) {
      console.warn(e);
    }
  };

  const handleStorageSet = async () => {
    setStorageStatus("Setting storage value...");
    if (!sdk?.storage) {
      setStorageStatus("❌ storage API not available");
      return;
    }
    try {
      await sdk.storage.set("demo_key", "Hello from Storage API!");
      setStorageStatus("✅ storage.set('demo_key', 'Hello from Storage API!') successful");
      // Refresh displayed items if we have any
      if (allStorageItems.length > 0) {
        const items = await sdk.storage.getAll();
        setAllStorageItems(items || []);
      }
    } catch (e) {
      setStorageStatus(`❌ storage.set failed: ${(e as Error).message || e}`);
    }
  };

  const handleStorageGet = async () => {
    setStorageStatus("Getting storage value...");
    if (!sdk?.storage) {
      setStorageStatus("❌ storage API not available");
      return;
    }
    try {
      const value = await sdk.storage.get("demo_key");
      if (value === null || value === undefined) {
        setStorageStatus("⚠️ storage.get('demo_key') returned null/undefined\n(Try setting a value first)");
      } else {
        setStorageStatus(`✅ storage.get('demo_key') = "${value}"`);
      }
    } catch (e) {
      setStorageStatus(`❌ storage.get failed: ${(e as Error).message || e}`);
    }
  };

  const handleStorageRemove = async () => {
    setStorageStatus("Removing storage value...");
    if (!sdk?.storage) {
      setStorageStatus("❌ storage API not available");
      return;
    }
    try {
      await sdk.storage.remove("demo_key");
      setStorageStatus("✅ storage.remove('demo_key') successful");
      // Refresh displayed items if we have any
      if (allStorageItems.length > 0) {
        const items = await sdk.storage.getAll();
        setAllStorageItems(items || []);
      }
    } catch (e) {
      setStorageStatus(`❌ storage.remove failed: ${(e as Error).message || e}`);
    }
  };

  const handleStorageClear = async () => {
    setStorageStatus("Clearing all storage...");
    if (!sdk?.storage) {
      setStorageStatus("❌ storage API not available");
      return;
    }
    try {
      await sdk.storage.clear();
      setStorageStatus("✅ storage.clear() successful\n(All storage for this mini app has been cleared)");
      setAllStorageItems([]); // Clear the displayed items
    } catch (e) {
      setStorageStatus(`❌ storage.clear failed: ${(e as Error).message || e}`);
    }
  };

  const handleStorageSetCustom = async () => {
    if (!storageKey.trim()) {
      setStorageStatus("❌ Please enter a key");
      return;
    }
    setStorageStatus(`Setting storage value for key "${storageKey}"...`);
    if (!sdk?.storage) {
      setStorageStatus("❌ storage API not available");
      return;
    }
    try {
      await sdk.storage.set(storageKey.trim(), storageValue);
      setStorageStatus(`✅ storage.set('${storageKey}', '${storageValue}') successful`);
      setStorageKey(""); // Clear inputs
      setStorageValue("");
      // Refresh displayed items if we have any
      if (allStorageItems.length > 0) {
        const items = await sdk.storage.getAll();
        setAllStorageItems(items || []);
      }
    } catch (e) {
      setStorageStatus(`❌ storage.set failed: ${(e as Error).message || e}`);
    }
  };

  const handleStorageGetAll = async () => {
    setStorageStatus("Getting all storage items...");
    if (!sdk?.storage) {
      setStorageStatus("❌ storage API not available");
      return;
    }
    try {
      const items = await sdk.storage.getAll();
      if (items && Array.isArray(items)) {
        setAllStorageItems(items);
        if (items.length === 0) {
          setStorageStatus("✅ storage.getAll() successful\n(No items stored yet)");
        } else {
          setStorageStatus(`✅ storage.getAll() successful\n(Found ${items.length} item(s))`);
        }
      } else {
        setStorageStatus("⚠️ storage.getAll() returned unexpected format");
        setAllStorageItems([]);
      }
    } catch (e) {
      setStorageStatus(`❌ storage.getAll failed: ${(e as Error).message || e}`);
      setAllStorageItems([]);
    }
  };

  // Camera API handlers
  const handleCameraTakePicture = async () => {
    setCameraStatus("Taking picture...");
    setCameraImageUri("");
    if (!sdk?.camera) {
      setCameraStatus("❌ camera API not available");
      return;
    }
    try {
      const result = await sdk.camera.takePicture({ quality: 0.8 });
      setCameraStatus(`✅ camera.takePicture() successful\nURI: ${result.uri}\nWidth: ${result.width}, Height: ${result.height}`);
      setCameraImageUri(result.uri);
    } catch (e) {
      setCameraStatus(`❌ camera.takePicture failed: ${(e as Error).message || e}`);
    }
  };

  const handleCameraPickImage = async () => {
    setCameraStatus("Picking image from gallery...");
    setCameraImageUri("");
    if (!sdk?.camera) {
      setCameraStatus("❌ camera API not available");
      return;
    }
    try {
      const result = await sdk.camera.pickImage({ quality: 0.8 });
      setCameraStatus(`✅ camera.pickImage() successful\nURI: ${result.uri}\nWidth: ${result.width}, Height: ${result.height}`);
      setCameraImageUri(result.uri);
    } catch (e) {
      setCameraStatus(`❌ camera.pickImage failed: ${(e as Error).message || e}`);
    }
  };

  // Location API handlers
  const handleLocationGetCurrentPosition = async () => {
    setLocationStatus("Getting current position...");
    setCurrentLocation(null);
    if (!sdk?.location) {
      setLocationStatus("❌ location API not available");
      return;
    }
    try {
      const result = await (sdk.location as any).getCurrentPosition({ accuracy: 'high' });
      setCurrentLocation(result);
      setLocationStatus(`✅ location.getCurrentPosition() successful\nLat: ${result.latitude}\nLng: ${result.longitude}\nAccuracy: ${result.accuracy}m`);
    } catch (e) {
      setLocationStatus(`❌ location.getCurrentPosition failed: ${(e as Error).message || e}`);
    }
  };

  const handleLocationWatchPosition = async () => {
    setWatchLocationStatus("Starting location watch...");
    setWatchedLocation(null);
    if (!sdk?.location) {
      setWatchLocationStatus("❌ location API not available");
      return;
    }
    try {
      const watchResult = await (sdk.location as any).watchPosition((location: any) => {
        setWatchedLocation(location);
        setWatchLocationStatus(`📍 Location update\nLat: ${location.latitude}\nLng: ${location.longitude}\nAccuracy: ${location.accuracy}m`);
      }, { accuracy: 'balanced', timeout: 1000 });
      setLocationWatchId(watchResult.watchId);
      setLocationClearWatch(() => watchResult.clearWatch);
      setWatchLocationStatus(`✅ Watching position (ID: ${watchResult.watchId})\nWaiting for updates...`);
    } catch (e) {
      setWatchLocationStatus(`❌ location.watchPosition failed: ${(e as Error).message || e}`);
    }
  };

  const handleLocationClearWatch = () => {
    if (locationClearWatch) {
      locationClearWatch();
      setLocationWatchId(null);
      setLocationClearWatch(null);
      setWatchedLocation(null);
      setWatchLocationStatus("✅ Watch cleared");
    }
  };

  const handleGetBalance = async () => {
    setBalanceStatus("Getting balance...");
    if (!sdk) {
      setBalanceStatus("❌ SDK not available");
      return;
    }
    if (!address) {
      setBalanceStatus(
        "❌ Address not available. Please connect wallet first.",
      );
      return;
    }
    try {
      // Check if getBalance method exists
      if (typeof sdk.getBalance !== "function") {
        setBalanceStatus(
          "❌ getBalance method not available on SDK. Available methods: " +
          Object.keys(sdk).join(", "),
        );
        return;
      }
      const balance = await sdk.getBalance();
      setBalanceStatus(`✅ Balance: ${balance || "Unable to fetch"}`);
    } catch (e) {
      const errorMsg = (e as Error).message || String(e);
      setBalanceStatus(`❌ Balance fetch failed: ${errorMsg}`);
      console.error("[Balance] Error:", e);
    }
  };

  // getTheme(): read current host theme/preferences
  const handleGetTheme = async () => {
    setThemeStatus("Getting theme...");
    if (!sdk) {
      setThemeStatus("❌ SDK not available");
      return;
    }
    try {
      const theme = await sdk.getTheme?.();
      setThemeStatus(`✅ Theme: ${JSON.stringify(theme, null, 2)}`);
    } catch (e) {
      setThemeStatus(`❌ Theme fetch failed: ${(e as Error).message || e}`);
    }
  };

  // showAlert(): native alert dialog
  const handleShowAlert = async () => {
    setAlertStatus("Showing alert...");
    if (!sdk) {
      setAlertStatus("❌ SDK not available");
      return;
    }
    try {
      await sdk.showAlert?.("This is a test alert from the SDK");
      setAlertStatus(`✅ Alert shown successfully`);
    } catch (e) {
      setAlertStatus(`❌ Alert failed: ${(e as Error).message || e}`);
    }
  };

  // showConfirm(): native confirm dialog returning boolean
  const handleShowConfirm = async () => {
    setConfirmStatus("Showing confirm dialog...");
    if (!sdk) {
      setConfirmStatus("❌ SDK not available");
      return;
    }
    try {
      const result = await sdk.showConfirm?.(
        "Do you want to proceed with this action?",
        "Yes, Proceed",
        "Cancel",
      );
      setConfirmStatus(
        `✅ Confirm dialog shown. Result: ${result ? "User confirmed" : "User cancelled"
        }`,
      );
    } catch (e) {
      setConfirmStatus(
        `❌ Confirm dialog failed: ${(e as Error).message || e}`,
      );
    }
  };

  // Clipboard.readText()/writeText(): interact with system clipboard
  const handleClipboard = async () => {
    setClipboardStatus("Testing clipboard...");
    if (!sdk) {
      setClipboardStatus("❌ SDK not available");
      return;
    }
    try {
      // Test writing to clipboard
      await (sdk as any).Clipboard?.writeText?.("Hello from Movement SDK!");
      const text = await (sdk as any).Clipboard?.readText?.();

      if (text === undefined || text === null) {
        setClipboardStatus(
          `❌ Clipboard read failed\nWritten: "Hello from Movement SDK!"\nRead: undefined (read not supported or failed)`,
        );
      } else {
        setClipboardStatus(
          `✅ Clipboard test successful!\nWritten: "Hello from Movement SDK!"\nRead: "${text}"`,
        );
      }
    } catch (e) {
      setClipboardStatus(
        `❌ Clipboard test failed: ${(e as Error).message || e}`,
      );
    }
  };

  const handleShare = async () => {
    setShareStatus("Opening share dialog...");
    if (!sdk) {
      setShareStatus("❌ SDK not available");
      return;
    }
    try {
      await sdk.share?.({
        title: "Movement Mini App",
        message:
          "Check out this awesome Movement mini app! Built on Movement blockchain.",
        url: "http://google.com",
      });
      setShareStatus("✅ Share dialog opened successfully!");
    } catch (e) {
      setShareStatus(`❌ Share failed: ${(e as Error).message || e}`);
    }
  };

  const handleOpenUrl = async (target: "external" | "in-app" = "external") => {
    setOpenUrlStatus(`Opening URL (${target})...`);
    if (!sdk) {
      setOpenUrlStatus("❌ SDK not available");
      return;
    }
    try {
      const testUrl = "http://google.com";
      await sdk.openUrl?.(testUrl, target);
      // Note: The SDK promise may resolve even if the URL doesn't actually open
      // This depends on the host implementation properly handling Linking.openURL or onOpenUrl callback
      setOpenUrlStatus(
        `✅ SDK call completed (check if URL opened)\nURL: ${testUrl}\nTarget: ${target}\n\n⚠️ If URL didn't open, check host implementation.`,
      );
    } catch (e) {
      setOpenUrlStatus(`❌ Open URL failed: ${(e as Error).message || e}`);
    }
  };

  // Two-step demo – Step 1: prepare a transaction payload
  const handleSignTransaction = async () => {
    setSignTxStatus("Preparing transaction...");
    setSignedTransaction(null);
    setSubmitTxStatus("");

    if (!sdk) {
      setSignTxStatus("❌ SDK not available");
      return;
    }

    try {
      // Create transaction payload (this simulates "signing" step)
      const transactionPayload = {
        function: "0x1::coin::transfer",
        arguments: [
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          "1",
        ],
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        title: "Demo Transfer (Pre-signed)",
        description: "Send 1 Octa to 0x…01",
      };

      setSignedTransaction(transactionPayload);
      setSignTxStatus(
        `✅ Transaction prepared successfully!\n\nTransaction payload created and ready to submit.\n\nPayload: ${JSON.stringify(
          transactionPayload,
          null,
          2,
        )}`,
      );
    } catch (e) {
      setSignTxStatus(
        `❌ Prepare transaction failed: ${(e as Error).message || e}`,
      );
    }
  };

  // Two-step demo – Step 2: submit prepared payload via sendTransaction()
  const handleSubmitTransaction = async () => {
    if (!signedTransaction) {
      setSubmitTxStatus(
        "❌ No transaction prepared. Please prepare a transaction first.",
      );
      return;
    }

    setSubmitTxStatus("Submitting prepared transaction...");

    if (!sdk) {
      setSubmitTxStatus("❌ SDK not available");
      return;
    }

    try {
      // Actually submit the transaction using sendTransaction
      const result = await sdk.sendTransaction(signedTransaction);

      if (result?.hash) {
        setSubmitTxStatus(
          `✅ Transaction submitted successfully!\n\nHash: ${result.hash}\nSuccess: ${result.success}`,
        );

        // Show hash in main transaction status
        setTxStatus({ hash: result.hash, status: "pending" });

        // Clear the prepared transaction
        setSignedTransaction(null);
      } else {
        setSubmitTxStatus(
          `❌ Transaction submission failed - no hash returned`,
        );
      }
    } catch (e) {
      setSubmitTxStatus(
        `❌ Submit transaction failed: ${(e as Error).message || e}`,
      );
    }
  };

  // MainButton: primary fixed overlay button controls
  const handleMainButtonShow = async () => {
    setMainButtonStatus("Checking MainButton availability...");

    if (!sdk) {
      setMainButtonStatus("❌ SDK not available");
      return;
    }

    if (!sdk.MainButton) {
      setMainButtonStatus(
        "❌ sdk.MainButton not available. Available SDK properties: " +
        Object.getOwnPropertyNames(sdk).join(", "),
      );
      return;
    }

    if (typeof sdk.MainButton.show !== "function") {
      setMainButtonStatus(
        "❌ sdk.MainButton.show is not a function. MainButton methods: " +
        Object.getOwnPropertyNames(sdk.MainButton).join(", "),
      );
      return;
    }

    try {
      const mainButton = sdk.MainButton;
      mainButton.setText("Demo Main Button");
      mainButton.show();
      mainButton.onClick(() => {
        setMainButtonStatus("✅ MainButton clicked! (This means it's working)");
        mainButton.hide();
      });
      setMainButtonStatus(
        "✅ MainButton.show() called successfully! You should see a button overlay at the bottom of this mini-app.",
      );
    } catch (e) {
      setMainButtonStatus(
        `❌ MainButton.show() failed: ${(e as Error).message || e}`,
      );
    }
  };

  // MainButton: hide overlay
  const handleMainButtonHide = async () => {
    if (!sdk?.MainButton) {
      setMainButtonStatus("❌ sdk.MainButton not available");
      return;
    }

    try {
      sdk.MainButton.hide();
      setMainButtonStatus("✅ MainButton.hide() called successfully!");
    } catch (e) {
      setMainButtonStatus(
        `❌ MainButton.hide() failed: ${(e as Error).message || e}`,
      );
    }
  };

  // SecondaryButton: secondary fixed overlay button controls
  const handleSecondaryButtonShow = async () => {
    setSecondaryButtonStatus("Checking SecondaryButton availability...");

    if (!sdk) {
      setSecondaryButtonStatus("❌ SDK not available");
      return;
    }

    if (!sdk.SecondaryButton) {
      setSecondaryButtonStatus(
        "❌ sdk.SecondaryButton not available. Available SDK properties: " +
        Object.getOwnPropertyNames(sdk).join(", "),
      );
      return;
    }

    try {
      const secondaryButton = sdk.SecondaryButton;
      secondaryButton.setText("Demo Secondary");
      secondaryButton.show();
      secondaryButton.onClick(() => {
        setSecondaryButtonStatus(
          "✅ SecondaryButton clicked! (This means it's working)",
        );
        secondaryButton.hide();
      });
      setSecondaryButtonStatus(
        "✅ SecondaryButton.show() called successfully! You should see a button overlay at the bottom of this mini-app.",
      );
    } catch (e) {
      setSecondaryButtonStatus(
        `❌ SecondaryButton.show() failed: ${(e as Error).message || e}`,
      );
    }
  };

  // SecondaryButton: hide overlay
  const handleSecondaryButtonHide = async () => {
    if (!sdk?.SecondaryButton) {
      setSecondaryButtonStatus("❌ sdk.SecondaryButton not available");
      return;
    }

    try {
      sdk.SecondaryButton.hide();
      setSecondaryButtonStatus(
        "✅ SecondaryButton.hide() called successfully!",
      );
    } catch (e) {
      setSecondaryButtonStatus(
        `❌ SecondaryButton.hide() failed: ${(e as Error).message || e}`,
      );
    }
  };

  // BackButton: top overlay back control
  const handleBackButtonShow = async () => {
    setBackButtonStatus("Checking BackButton availability...");

    if (!sdk) {
      setBackButtonStatus("❌ SDK not available");
      return;
    }

    if (!sdk.BackButton) {
      setBackButtonStatus(
        "❌ sdk.BackButton not available. Available SDK properties: " +
        Object.getOwnPropertyNames(sdk).join(", "),
      );
      return;
    }

    try {
      const backButton = sdk.BackButton;
      backButton.show();
      backButton.onClick(() => {
        setBackButtonStatus("✅ BackButton clicked! (This means it's working)");
        backButton.hide();
      });
      setBackButtonStatus(
        "✅ BackButton.show() called successfully! You should see a back button overlay at the top of this mini-app.",
      );
    } catch (e) {
      setBackButtonStatus(
        `❌ BackButton.show() failed: ${(e as Error).message || e}`,
      );
    }
  };

  // BackButton: hide overlay
  const handleBackButtonHide = async () => {
    if (!sdk?.BackButton) {
      setBackButtonStatus("❌ sdk.BackButton not available");
      return;
    }

    try {
      sdk.BackButton.hide();
      setBackButtonStatus("✅ BackButton.hide() called successfully!");
    } catch (e) {
      setBackButtonStatus(
        `❌ BackButton.hide() failed: ${(e as Error).message || e}`,
      );
    }
  };

  // signMessage(): sign an arbitrary message
  const handleSignMessage = async () => {
    setSignMessageStatus("Signing message...");
    setSignedMessage(null);

    console.log("=== SIGN MESSAGE DEBUG ===");
    console.log("SDK available:", !!sdk);
    console.log("SDK object:", sdk);
    console.log("SDK methods:", sdk ? Object.getOwnPropertyNames(sdk) : "N/A");
    console.log("Is connected:", isConnected);

    if (!sdk) {
      setSignMessageStatus("❌ SDK not available");
      return;
    }

    if (!isConnected) {
      setSignMessageStatus("❌ Wallet not connected");
      return;
    }

    // Check for different possible sign message method names
    const sdkAny = sdk as any;
    const signMethod =
      sdkAny.signMessage ||
      sdkAny.sign_message ||
      sdkAny.signPersonalMessage ||
      sdkAny.signPersonalMessage;

    if (!signMethod) {
      setSignMessageStatus(
        `❌ Sign message method not available on SDK\n\nAvailable methods: ${Object.getOwnPropertyNames(sdk).join(", ")}\n\nSDK type: ${typeof sdk}\nSDK keys: ${Object.keys(sdk)}\n\nLooking for: signMessage, sign_message, signPersonalMessage\n\nThis method may not be implemented in the current SDK version.`,
      );
      return;
    }

    try {
      const testMessage =
        "Hello from Movement Mini App! This is a test message for signing.";
      const result = await signMethod(testMessage, Date.now().toString());
      const publicKey =
        result?.publicKey || result?.pubKey || result?.public_key || "";

      setSignedMessage(result);
      setSignMessageStatus(
        `✅ Message signed successfully!\n\n` +
        `Message: "${testMessage}"\n` +
        `Signature: ${result?.signature || "(missing)"}\n` +
        `Public Key: ${publicKey || "(missing from host response)"}`,
      );
    } catch (e) {
      setSignMessageStatus(
        `❌ Message signing failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  };

  // sendNotification(): request host to deliver a push notification
  const handleNotification = async () => {
    console.log("=== NOTIFICATION BUTTON CLICKED ===");
    setNotificationStatus("Button clicked!");

    if (!sdk) {
      setNotificationStatus("SDK not available");
      return;
    }

    setNotificationStatus("Sending notification...");
    try {
      const sdkAny = sdk as any;
      console.log("=== NOTIFICATION DEBUG ===");
      console.log("SDK object:", sdk);
      console.log("All SDK methods:", Object.getOwnPropertyNames(sdk));
      console.log("SDK.sendNotification type:", typeof sdkAny.sendNotification);
      console.log("SDK.sendNotification value:", sdkAny.sendNotification);
      console.log("SDK.notify type:", typeof sdk.notify);
      console.log("SDK.notify value:", sdk.notify);

      // Check if sendNotification method is available (it's in the available methods list!)
      if (!sdkAny.sendNotification) {
        setNotificationStatus(
          "❌ sendNotification method not available. Available methods: " +
          Object.getOwnPropertyNames(sdk).join(", "),
        );
        return;
      }

      console.log("Using sendNotification method (found in available methods)");

      // Try different notification approaches for dev build
      console.log("Trying basic notification...");
      const result1 = await sdkAny.sendNotification({
        title: "Test Notification",
        body: "If you see this, notifications are working!",
      });

      console.log("Basic notification result:", result1);

      // Try with different options
      console.log("Trying notification with badge...");
      const result2 = await sdkAny.sendNotification({
        title: "Test with Badge",
        body: "This should show a badge if notifications work",
        badge: 1,
      });

      console.log("Badge notification result:", result2);

      // Try minimal notification
      console.log("Trying minimal notification...");
      const result3 = await sdkAny.sendNotification({
        title: "Minimal Test",
        body: "Minimal notification test",
      });

      console.log("Minimal notification result:", result3);

      // Try browser notifications as fallback for dev builds
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Browser Notification Test", {
            body: "This is a browser notification fallback",
            icon: "/favicon.ico",
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Browser Notification Test", {
                body: "This is a browser notification fallback",
                icon: "/favicon.ico",
              });
            }
          });
        }
      }

      setNotificationStatus(
        "✅ Notifications sent! For dev builds, check Movement Everything app settings for notification options. Also check browser console for detailed results.",
      );
    } catch (error) {
      console.error("Notification failed:", error);
      setNotificationStatus(`❌ Failed: ${(error as Error).message || error}`);
    }
  };

  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="flex min-h-[120px] flex-col justify-center rounded-2xl border-2 border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-2xl">
      <div className="mb-3 text-lg font-bold text-white/80">{label}</div>
      <div
        className={`text-center font-mono text-2xl font-bold whitespace-nowrap ${value === "✗"
          ? "text-red-500"
          : value === "✓"
            ? "text-green-500"
            : "text-white"
          }`}
      >
        {value || "—"}
      </div>
    </div>
  );

  const disabled = useMemo(() => {
    const isDisabled = !sdk || !isInstalled || !isReady;
    console.log("Button disabled state:", {
      sdk: !!sdk,
      isInstalled,
      isReady,
      disabled: isDisabled,
      sdkMethods: sdk ? Object.getOwnPropertyNames(sdk) : "no sdk",
    });
    return isDisabled;
  }, [sdk, isInstalled, isReady]);

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-4xl space-y-6 py-6">
        <div style={{ fontSize: '4rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <MultiOutlineText
            color="#81FFBA"
            fontWeight="900"
            letterSpacing="1.28px"
            lineHeight="110%"
            textAlign="center"
          >
            MINI APP DEMO
          </MultiOutlineText>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>SDK Connectivity</CardTitle>
            <CardDescription>
              isInstalled, isReady, isConnected, network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="flex flex-col items-center justify-center p-4 text-center border-2 border-white/10 bg-white/5">
                <div className="mb-2 text-xs font-medium text-white/60 uppercase tracking-wide">Installed</div>
                <div className={`text-lg font-bold ${isInstalled ? 'text-green-400' : 'text-red-400'}`}>
                  {String(isInstalled)}
                </div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 text-center border-2 border-white/10 bg-white/5">
                <div className="mb-2 text-xs font-medium text-white/60 uppercase tracking-wide">Ready</div>
                <div className={`text-lg font-bold ${isReady ? 'text-green-400' : 'text-red-400'}`}>
                  {String(isReady)}
                </div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 text-center border-2 border-white/10 bg-white/5">
                <div className="mb-2 text-xs font-medium text-white/60 uppercase tracking-wide">Connected</div>
                <div className={`text-lg font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {String(isConnected)}
                </div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 text-center border-2 border-white/10 bg-white/5">
                <div className="mb-2 text-xs font-medium text-white/60 uppercase tracking-wide">Network</div>
                <div className="text-lg font-bold text-white font-mono">
                  {network || "—"}
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Account & Balance */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account & Balance</CardTitle>
            <CardDescription>getUserInfo, getBalance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={disabled}
                onClick={fetchUserInfo}
                variant="default"
                color="green"
                size="lg"
              >
                Get User Info
              </Button>
              <Button
                disabled={disabled}
                onClick={handleGetBalance}
                variant="default"
                color="green"
                size="lg"
              >
                Get Balance
              </Button>
            </div>

            {/* Simple status display */}
            {userInfoStatus && (
              <Card className="mt-3">
                <CardContent className="p-3">
                  <div className="mb-1 text-xs text-gray-400">
                    User Info Status:
                  </div>
                  <div className="max-h-64 overflow-y-auto font-mono text-xs break-all whitespace-pre-wrap text-gray-400">
                    {userInfoStatus}
                  </div>
                </CardContent>
              </Card>
            )}
            {balanceStatus && (
              <Card className="mt-3">
                <CardContent className="p-3">
                  <div className="mb-1 text-xs text-gray-400">
                    Balance Status:
                  </div>
                  <div className="max-h-64 overflow-y-auto font-mono text-xs break-all whitespace-pre-wrap text-gray-400">
                    {balanceStatus}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              sendTransaction, signTransaction, waitForTransaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* One-step process */}
              <div>
                <Button
                  disabled={disabled || !isConnected}
                  onClick={handleSendTx}
                  variant="default"
                  color="green"
                  size="lg"
                >
                  Send Transaction
                </Button>
                <div className="mt-1 text-xs text-gray-400">
                  Signs and submits transaction in one step.
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              waitForTransaction is used automatically after sendTransaction.
            </div>
            {txStatus && (
              <Card>
                <CardContent className="p-3 text-sm">
                  <div className="font-mono break-words">
                    hash:{" "}
                    {txStatus.hash ? (
                      <a
                        href={`https://explorer.movementnetwork.xyz/txn/${txStatus.hash}?network=mainnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-500 underline hover:text-cyan-600"
                      >
                        {txStatus.hash}
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>
                  <div>status: {txStatus.status}</div>
                  {txStatus.error && (
                    <div className="text-red-400">error: {txStatus.error}</div>
                  )}
                </CardContent>
              </Card>
            )}
            {signTxStatus && (
              <Card>
                <CardContent className="p-3 text-sm">
                  <div className="mb-1 text-xs text-gray-400">
                    Step 1 - Sign Transaction Status:
                  </div>
                  <div className="max-h-64 overflow-y-auto font-mono text-xs break-all whitespace-pre-wrap text-gray-400">
                    {signTxStatus}
                  </div>
                </CardContent>
              </Card>
            )}
            {submitTxStatus && (
              <Card>
                <CardContent className="p-3 text-sm">
                  <div className="mb-1 text-xs text-gray-400">
                    Step 2 - Submit Transaction Status:
                  </div>
                  <div className="max-h-64 overflow-y-auto font-mono text-xs break-all whitespace-pre-wrap text-gray-400">
                    {submitTxStatus}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Message Signing */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Message Signing</CardTitle>
            <CardDescription>signMessage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={disabled || !isConnected}
                  onClick={handleSignMessage}
                  variant="default"
                  color="green"
                  size="lg"
                >
                  Sign Test Message
                </Button>
              </div>
              <div className="text-xs text-gray-400">
                Sign an arbitrary message for authentication or verification
              </div>

              {signMessageStatus && (
                <Card>
                  <CardContent className="p-3 text-sm">
                    <div className="mb-1 text-xs text-gray-400">
                      Sign Message Status:
                    </div>
                    <div
                      className="max-h-64 overflow-y-auto font-mono text-xs text-gray-400"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {signMessageStatus}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device & UI */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Device & UI</CardTitle>
            <CardDescription>
              scanQRCode, showPopup, showAlert, showConfirm, sendNotification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={disabled}
                onClick={handleScan}
                variant="default"
                color="green"
                size="lg"
              >
                Scan QR Code
              </Button>
              <Button
                disabled={disabled}
                onClick={handlePopup}
                variant="default"
                color="green"
                size="lg"
              >
                Show Popup
              </Button>
              <Button
                disabled={disabled}
                onClick={handleShowAlert}
                variant="default"
                color="green"
                size="lg"
              >
                Show Alert
              </Button>
              <Button
                disabled={disabled}
                onClick={handleShowConfirm}
                variant="default"
                color="green"
                size="lg"
              >
                Show Confirm
              </Button>
              <Button
                disabled={disabled}
                onClick={handleNotification}
                variant="default"
                color="green"
                size="lg"
              >
                Send Notification
              </Button>
            </div>
            {notificationStatus && (
              <Card>
                <CardContent className="p-3 text-sm">
                  <div className="mb-1 text-xs text-gray-400">
                    Notification Status:
                  </div>
                  <div className="text-gray-400">{notificationStatus}</div>
                </CardContent>
              </Card>
            )}
            {alertStatus && (
              <Card>
                <CardContent className="p-3 text-sm">
                  <div className="mb-1 text-xs text-gray-400">
                    Alert Status:
                  </div>
                  <div className="text-gray-400">{alertStatus}</div>
                </CardContent>
              </Card>
            )}
            {confirmStatus && (
              <Card>
                <CardContent className="p-3 text-sm">
                  <div className="mb-1 text-xs text-gray-400">
                    Confirm Status:
                  </div>
                  <div className="text-gray-400">{confirmStatus}</div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Storage (Device-local) */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Storage (Device-local)</CardTitle>
            <CardDescription>storage.set, storage.get, storage.remove, storage.clear, storage.getAll</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              <Button
                disabled={disabled}
                onClick={handleStorageSet}
                variant="default"
                color="green"
                size="lg"
              >
                storage.set
              </Button>
              <Button
                disabled={disabled}
                onClick={handleStorageGet}
                variant="default"
                color="green"
                size="lg"
              >
                storage.get
              </Button>
              <Button
                disabled={disabled}
                onClick={handleStorageRemove}
                variant="default"
                color="green"
                size="lg"
              >
                storage.remove
              </Button>
              <Button
                disabled={disabled}
                onClick={handleStorageClear}
                variant="default"
                color="green"
                size="lg"
              >
                storage.clear
              </Button>
              <Button
                disabled={disabled}
                onClick={handleStorageGetAll}
                variant="default"
                color="green"
                size="lg"
              >
                storage.getAll
              </Button>
            </div>

            {/* Custom Storage Input */}
            <div className="mb-4 space-y-2">
              <div className="text-sm text-gray-400 mb-2">Add Custom Storage Item:</div>
              <input
                type="text"
                placeholder="Key (e.g., 'username')"
                value={storageKey}
                onChange={(e) => setStorageKey(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                disabled={disabled}
              />
              <textarea
                placeholder="Value (e.g., 'john_doe')"
                value={storageValue}
                onChange={(e) => setStorageValue(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-green-500 min-h-[60px]"
                disabled={disabled}
              />
              <Button
                disabled={disabled || !storageKey.trim()}
                onClick={handleStorageSetCustom}
                variant="default"
                color="green"
                size="lg"
                className="w-full"
              >
                Set Custom Item
              </Button>
            </div>

            {/* Display All Storage Items */}
            {allStorageItems.length > 0 && (
              <Card className="mt-4 bg-gray-800">
                <CardContent className="p-3">
                  <div className="mb-2 text-xs text-gray-400">
                    All Stored Items ({allStorageItems.length}):
                  </div>
                  <div className="space-y-2">
                    {allStorageItems.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 bg-gray-900 rounded border border-gray-700"
                      >
                        <div className="text-xs text-gray-500 mb-1">Key:</div>
                        <div className="text-sm text-white font-mono mb-2 break-all">
                          {item.key}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Value:</div>
                        <div className="text-sm text-gray-300 font-mono break-all">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {storageStatus && (
              <Card className="mt-4">
                <CardContent className="p-3 text-sm">
                  <div className="mb-1 text-xs text-gray-400">
                    Storage Status:
                  </div>
                  <div className="whitespace-pre-wrap text-gray-400">
                    {storageStatus}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Camera */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Camera</CardTitle>
            <CardDescription>camera.takePicture, camera.pickImage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={disabled}
                onClick={handleCameraTakePicture}
                variant="default"
                color="green"
                size="lg"
              >
                camera.takePicture
              </Button>
              <Button
                disabled={disabled}
                onClick={handleCameraPickImage}
                variant="default"
                color="green"
                size="lg"
              >
                camera.pickImage
              </Button>
            </div>
            {cameraStatus && (
              <div className="mt-4 p-3 bg-gray-800 rounded text-sm whitespace-pre-wrap">
                Camera Status:
                <br />
                {cameraStatus}
              </div>
            )}
            {cameraImageUri && (
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Image Preview:</div>
                <img
                  src={cameraImageUri}
                  alt="Camera preview"
                  className="max-w-full h-auto rounded border border-gray-700"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>location.getCurrentPosition, location.watchPosition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                disabled={disabled}
                onClick={handleLocationGetCurrentPosition}
                variant="default"
                color="green"
                size="lg"
                className="w-full"
                style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
              >
                getCurrentPosition
              </Button>
              {locationStatus && (
                <div className="text-sm whitespace-pre-wrap p-3 bg-gray-900 rounded">
                  <strong>Status:</strong>
                  <br />
                  {locationStatus}
                </div>
              )}
              {currentLocation && (
                <div className="text-sm">
                  <strong>Current Location:</strong>
                  <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-auto">
                    {JSON.stringify(currentLocation, null, 2)}
                  </pre>
                </div>
              )}
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <Button
                  disabled={disabled || !!locationWatchId}
                  onClick={handleLocationWatchPosition}
                  variant="default"
                  color="green"
                  size="lg"
                  className="w-full"
                >
                  watchPosition
                </Button>
                {locationWatchId && (
                  <Button
                    disabled={disabled}
                    onClick={handleLocationClearWatch}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Clear Watch
                  </Button>
                )}
                {watchLocationStatus && (
                  <div className="text-sm whitespace-pre-wrap p-3 bg-gray-900 rounded">
                    <strong>Watch Status:</strong>
                    <br />
                    {watchLocationStatus}
                  </div>
                )}
                {watchedLocation && (
                  <div className="text-sm">
                    <strong>Watched Location:</strong>
                    <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-auto">
                      {JSON.stringify(watchedLocation, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CloudStorage & Clipboard */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>CloudStorage & Clipboard</CardTitle>
            <CardDescription>CloudStorage, Clipboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={disabled}
                onClick={handleStorage}
                variant="default"
                color="green"
                size="lg"
              >
                CloudStorage
              </Button>
              <Button
                disabled={disabled}
                onClick={handleClipboard}
                variant="default"
                color="green"
                size="lg"
              >
                Clipboard
              </Button>
            </div>
            {clipboardStatus && (
              <Card className="mt-4">
                <CardContent className="p-3 text-sm">
                  <div className="mb-1 text-xs text-gray-400">
                    Clipboard Status:
                  </div>
                  <div className="whitespace-pre-wrap text-gray-400">
                    {clipboardStatus}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Share & Open URL */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Share & Open URL</CardTitle>
            <CardDescription>share, openUrl</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={disabled}
                onClick={handleShare}
                variant="default"
                color="green"
                size="lg"
              >
                Share
              </Button>
              <Button
                disabled={disabled}
                onClick={() => handleOpenUrl("in-app")}
                variant="default"
                color="green"
                size="lg"
              >
                Open URL (In-App)
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Share opens the native share dialog. Open URL opens URLs in
              in-app browser.
            </div>
            {shareStatus && (
              <Card className="mt-3">
                <CardContent className="p-3 text-sm">
                  <div className="mb-1 text-xs text-gray-400">
                    Share Status:
                  </div>
                  <div className="whitespace-pre-wrap text-gray-400">
                    {shareStatus}
                  </div>
                </CardContent>
              </Card>
            )}
            {openUrlStatus && (
              <Card className="mt-3">
                <CardContent className="p-3 text-sm">
                  <div className="mb-1 text-xs text-gray-400">
                    Open URL Status:
                  </div>
                  <div className="whitespace-pre-wrap text-gray-400">
                    {openUrlStatus}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>getTheme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                disabled={disabled}
                onClick={handleGetTheme}
                variant="default"
                color="green"
                size="lg"
              >
                get theme
              </Button>

              {themeStatus && (
                <Card>
                  <CardContent className="p-3 text-sm">
                    <div className="mb-1 text-xs text-gray-400">
                      Theme Status:
                    </div>
                    <div className="max-h-64 overflow-y-auto font-mono text-xs break-all whitespace-pre-wrap text-gray-400">
                      {themeStatus}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Haptics */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Haptics</CardTitle>
            <CardDescription>haptic feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-400">
                    Impact Feedback:
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      disabled={disabled}
                      onClick={() => handleHaptic("impact", "light")}
                      variant="default"
                      color="green"
                      size="lg"
                    >
                      Light
                    </Button>
                    <Button
                      disabled={disabled}
                      onClick={() => handleHaptic("impact", "medium")}
                      variant="default"
                      color="green"
                      size="lg"
                    >
                      Medium
                    </Button>
                    <Button
                      disabled={disabled}
                      onClick={() => handleHaptic("impact", "heavy")}
                      variant="default"
                      color="green"
                      size="lg"
                    >
                      Heavy
                    </Button>
                    <Button
                      disabled={disabled}
                      onClick={() => handleHaptic("impact", "rigid")}
                      variant="default"
                      color="green"
                      size="lg"
                    >
                      Rigid
                    </Button>
                    <Button
                      disabled={disabled}
                      onClick={() => handleHaptic("impact", "soft")}
                      variant="default"
                      color="green"
                      size="lg"
                    >
                      Soft
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-400">
                    Notification Feedback:
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      disabled={disabled}
                      onClick={() => handleHaptic("notification", "success")}
                      variant="default"
                      color="green"
                      size="lg"
                    >
                      Success
                    </Button>
                    <Button
                      disabled={disabled}
                      onClick={() => handleHaptic("notification", "warning")}
                      variant="default"
                      color="green"
                      size="lg"
                    >
                      Warning
                    </Button>
                    <Button
                      disabled={disabled}
                      onClick={() => handleHaptic("notification", "error")}
                      variant="default"
                      color="green"
                      size="lg"
                    >
                      Error
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-400">
                    Selection Feedback:
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      disabled={disabled}
                      onClick={() => handleHaptic("selection")}
                      variant="default"
                      color="green"
                      size="lg"
                    >
                      Selection
                    </Button>
                  </div>
                </div>
              </div>

              {hapticStatus && (
                <Card>
                  <CardContent className="p-3 text-sm">
                    <div className="mb-1 text-xs text-gray-400">
                      Haptic Status:
                    </div>
                    <div className="max-h-64 overflow-y-auto font-mono text-xs break-all whitespace-pre-wrap text-gray-400">
                      {hapticStatus}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Debug</CardTitle>
            <CardDescription>Available SDK methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-xs text-gray-400">
              Found {sdkMethods.length} methods/properties on SDK:
            </div>
            <Card>
              <CardContent className="max-h-64 overflow-y-auto p-3 font-mono text-xs break-all text-gray-400">
                {sdkMethods.length > 0
                  ? sdkMethods.join(", ")
                  : "No methods found"}
              </CardContent>
            </Card>
            <div className="mt-2 text-xs text-gray-500">
              Check browser console for detailed method inspection.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
