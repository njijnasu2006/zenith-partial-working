# 📲 How to Install Your Pothole Detector App

Congratulations! Once the GitHub Action build turns **Green (Success)**, follow these steps to get the app on your phone.

## 1. Download the APK
1.  Go to your GitHub Repository page.
2.  Click on the **Actions** tab at the top.
3.  Click on the most recent workflow run (look for "Build Android App" at the top).
4.  Scroll down to the bottom of the page to the **Artifacts** section.
5.  Click on **`app-debug`**. This will download a `.zip` file to your computer.

## 2. Extract the APK
1.  Locate the downloaded `app-debug.zip` on your computer.
2.  Right-click and select **Extract All** (or unzip it using any tool).
3.  Inside, you will find a file named `app-debug.apk`. This is your Android App!

## 3. Transfer to Phone
You need to move this `.apk` file to your phone. You can use any method:
*   **USB Cable**: Connect phone to PC, drag and drop the file.
*   **Google Drive / Cloud**: Upload to Drive on PC, open Drive on Phone and download.
*   **WhatsApp / Telegram**: Send the file to yourself.

## 4. Install on Android
1.  On your phone, locate the `app-debug.apk` file using your File Manager or the app you used to transfer it.
2.  Tap on the file to install.
3.  **Security Warning**: You will likely see a popup saying "Install from unknown sources is not allowed".
    *   Tap **Settings** on that popup.
    *   Toggle **Allow** for the app you are using (e.g., Chrome, Files, WhatsApp).
    *   Go back and tap **Install** again.

## 5. Permissions
1.  Open the **PotholeDetector** app.
2.  Grant the requested permissions (Camera, Location, Notifications) so the app can detect potholes and use the map.

## 🚀 Ready to Testing
-   **Auto Mode**: Drive (or walk) around. The app will try to connect to the ESP32 (if you have one).
-   **Manual Mode**: Tap the `+` button, take a picture of a road surface, and see Gemini analyze it!
