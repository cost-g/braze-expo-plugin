# 1.2.0

##### Added
- Updates the `enableBrazeIosPush` configuration to use the [automatic push handling](https://braze-inc.github.io/braze-swift-sdk/tutorials/braze/b1-standard-push-notifications#Option-1-Automatic-push-notification-handling) features from the Braze Swift SDK.
  - Starting in version [8.2.0](https://github.com/braze-inc/braze-react-native-sdk/releases/tag/8.2.0) of the Braze React Native SDK, this change allows the Braze Expo plugin to be compatible with incoming iOS notifications from Expo Notifications.
- Adds the `iosRequestPushPermissionsAutomatically` configuration to control whether iOS push permissions should be requested automatically on app launch.

# 1.1.2

##### Added
- Added Android support for the following configuration fields:
  - `androidPushNotificationHtmlRenderingEnabled, androidNotificationSmallIcon, androidNotificationLargeIcon, androidNotificationAccentColor`
- Added support for configuring a fallback Firebase Messaging Service on Android via `androidFirebaseMessagingFallbackServiceEnabled` and `androidFirebaseMessagingFallbackServiceClasspath`.
  - For example, if your fallback Firebase Messaging Service was `expo.modules.notifications.service.ExpoFirebaseMessagingService`, then your configuration would need to include:
  ```
    "androidFirebaseMessagingFallbackServiceEnabled": true,
    "androidFirebaseMessagingFallbackServiceClasspath": "expo.modules.notifications.service.ExpoFirebaseMessagingService",
  ```
  - You can find the proper fallback classpath in your Android merged `AndroidManifest.xml` file.
- Updated the sample app with version `6.0.1` of the the Braze React Native SDK.
  - This version demonstrates usage of the New Architecture and the Braze SDK as a Turbo Module.

# 1.1.1

##### Fixed
- Fixed an issue where `Braze.getInitialUrl()` could incorrectly return `null`.

# 1.1.0

##### ⚠ Breaking
- Now requires Braze React Native SDK v2.1.0+.
- Updates the default Kotlin version to 1.8.10 for Expo 48 compatibility. This value is overridden by the [`android.kotlinVersion`](https://docs.expo.dev/versions/latest/sdk/build-properties/#pluginconfigtypeandroid) property in `app.json`.

##### Changed
- No longer requires static linkage of frameworks for iOS.

# 1.0.1

##### Fixed
- Fixed an issue introduced in 1.0.0 where setting `enableAutoLocationCollection` to any value in `app.json` would enable the option on iOS.

# 1.0.0

##### ⚠ Breaking
- Adds support for Braze React Native SDK v2.0.2+. This version is not backwards compatible with previous versions of Braze React Native SDK.

# 0.6.0

##### ⚠ Breaking
- The Braze Expo Plugin now requires Expo 47.
- `google-services.json` is no longer required to be placed in the `assets` folder. The filepath is now set in `app.json` through the [`googleServicesFile`](https://docs.expo.dev/versions/latest/config/app/#googleservicesfile-1) property.

##### Added
- Added a new configuration prop `androidHandlePushDeepLinksAutomatically` that allows the Braze SDK to automatically handle push deep links on Android.

# 0.5.0

##### ⚠ Breaking
- The iOS deployment target has been changed to 13.0 for compatibility with Expo 47.

# 0.4.0

##### ⚠ Breaking
- Renamed the prop `fcmSenderID` to `firebaseCloudMessagingSenderId`.

##### Added
- Added support for Android and iOS push.

# 0.3.1

##### Fixed
- Fixed an issue where the `minimumTriggerIntervalInSeconds` prop did not work as expected on Android.

# 0.3.0

##### ⚠ Breaking
- Renamed `customEndpoint` to `baseUrl`.

# 0.2.0

##### ⚠ Breaking
- Removed the `apiKey` prop and replaced it with `iosApiKey` and `androidApiKey` parameters, both of which are required.

# 0.1.0

- Initial release with support for in-app messages, content cards, and analytics.
