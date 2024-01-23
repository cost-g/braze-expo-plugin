import { writeFileSync } from 'fs';
import { resolve } from 'path';

import {
  ConfigPlugin,
  withProjectBuildGradle,
  withDangerousMod,
  withAppBuildGradle,
  AndroidConfig,
  withGradleProperties,
  withAndroidManifest,
  ExportedConfigWithProps
} from "expo/config-plugins";

import { ConfigProps } from './types';
import {
  GRADLE_APPEND_ID,
  BUILDSCRIPT_LEVEL_GRADLE,
  APP_LEVEL_GRADLE,
  BRAZE_SDK_REQUIRED_PERMISSIONS,
  ANDROID_BRAZE_XML_PATH,
  ANDROID_FIREBASE_MESSAGING_SERVICE_CLASS_PATH,
  BX_STR,
  BX_INT,
  BX_BOOL,
  BX_DRAWABLE,
  BX_COLOR,
  ANDROID_CONFIG_MAP
} from './brazeAndroidConstants'

async function writeBrazeXml(
  projectRoot: string,
  props: ConfigProps
) {
  const destinationPath = resolve(projectRoot, ANDROID_BRAZE_XML_PATH);

  try {
    let brazeXml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
    brazeXml += '<string-array name="com_braze_internal_sdk_metadata">\n<item>GRADLE</item>\n</string-array>\n'

    Object.entries(props).forEach(([key, value]) => {
      const mappedConfigInfo = ANDROID_CONFIG_MAP[key as keyof typeof ANDROID_CONFIG_MAP];
      if (value == null || mappedConfigInfo == null) {
        // If it's not defined just move on
        return;
      }

      // Should be the Braze configuration name, such as "com_braze_api_key"
      const xmlKeyName = mappedConfigInfo[0];
      // Should be the `braze.xml` key, such as "string"
      const xmlKeyType = mappedConfigInfo[1];

      brazeXml += "\n  ";
      switch (xmlKeyType) {
        case BX_STR:
          brazeXml += `<${xmlKeyType} translatable="false" name="${xmlKeyName}">${value}</${xmlKeyType}>`;
          break;
        case BX_INT:
          brazeXml += `<${xmlKeyType} name="${xmlKeyName}">${value}</${xmlKeyType}>`;
          break;
        case BX_BOOL:
          brazeXml += `<${xmlKeyType} name="${xmlKeyName}">${value}</${xmlKeyType}>`;
          break;
        case BX_DRAWABLE:
          brazeXml += `<${xmlKeyType} name="${xmlKeyName}">${value}</${xmlKeyType}>`;
          break;
        case BX_COLOR:
          brazeXml += `<${xmlKeyType} name="${xmlKeyName}">${value}</${xmlKeyType}>`;
          break;
      }
    });
    brazeXml += "\n</resources>\n";

    writeFileSync(destinationPath, brazeXml);
  } catch (e) {
    throw new Error(
      `Cannot write braze.xml file to ${destinationPath}.\n${e}`
    );
  }
  return true;
}

async function writeFirebaseMessagingServiceClass(projectRoot: string) {
  const destinationPath = resolve(projectRoot, ANDROID_FIREBASE_MESSAGING_SERVICE_CLASS_PATH);

  try {
    let firebaseMessagingServiceClass = `package com.FirebaseMessagingService;\n`
    firebaseMessagingServiceClass += `import com.google.firebase.messaging.FirebaseMessagingService;\n`
    firebaseMessagingServiceClass += `import com.google.firebase.messaging.RemoteMessage;\n`
    firebaseMessagingServiceClass += `import com.braze.push.BrazeFirebaseMessagingService;\n\n`
    firebaseMessagingServiceClass += `public class MyFirebaseMessagingService extends FirebaseMessagingService {\n`
    firebaseMessagingServiceClass += `  @Override\n`
    firebaseMessagingServiceClass += `    public void onMessageReceived(RemoteMessage remoteMessage) {\n`
    firebaseMessagingServiceClass += `        if (BrazeFirebaseMessagingService.handleBrazeRemoteMessage(this, remoteMessage)) {\n`
    firebaseMessagingServiceClass += `            // This Remote Message originated from Braze and a push notification was displayed.\n`
    firebaseMessagingServiceClass += `            // No further action is needed.\n`
    firebaseMessagingServiceClass += `        } else {\n`
    firebaseMessagingServiceClass += `            super.onMessageReceived(remoteMessage);\n`
    firebaseMessagingServiceClass += `            // This Remote Message did not originate from Braze.\n`
    firebaseMessagingServiceClass += `            // No action was taken and you can safely pass this Remote Message to other handlers.\n`
    firebaseMessagingServiceClass += `        }\n`
    firebaseMessagingServiceClass += `    }\n`
    firebaseMessagingServiceClass += `}\n`

    writeFileSync(destinationPath, firebaseMessagingServiceClass);
  } catch (e) {
    throw new Error(
      `Cannot write MyFirebaseMessagingService.java file to ${destinationPath}.\n${e}`
    );
  }
  return true;
}

async function appendContentsToConfig(newConfig: ExportedConfigWithProps<AndroidConfig.Paths.GradleProjectFile>, newContents: string) {
  let { contents } = newConfig.modResults;
  // Don't add this twice
  if (!contents.includes(GRADLE_APPEND_ID)) {
    contents += newContents;
    newConfig.modResults.contents = contents;
  }
  return newConfig;
}

function addServices(androidManifest) {
  const { manifest } = androidManifest;

  if (!Array.isArray(manifest["application"])) {
    console.warn(
      "withWordlLineIntentActivity: No application array in manifest?"
    );
    return androidManifest;
  }

  const application = manifest["application"].find(
    (item) => item.$["android:name"] === ".MainApplication"
  );
  if (!application) {
    console.warn("withWordlLineIntentActivity: No .MainApplication?");
    return androidManifest;
  }

  const service = {};
  service.$ = {
    ...service.$,
    ...{
      "android.name": "com.FirebaseMessagingService.MyFirebaseMessagingService",
      "android:exported": "false"
    }
  };

  const action = {};
  action.$ = {
    ...action.$,
    ...{
      "android:name": "com.google.firebase.MESSAGING_EVENT",
    },
  };

  const intent = { action };
  service["intent-filter"].push(intent);

  return androidManifest;
}

export const withAndroidBrazeSdk: ConfigPlugin<ConfigProps> = (config, props) => {
  config = AndroidConfig.Permissions.withPermissions(config, BRAZE_SDK_REQUIRED_PERMISSIONS);

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      await writeBrazeXml(config.modRequest.projectRoot, props);
      await writeFirebaseMessagingServiceClass(config.modRequest.projectRoot);
      return config;
    },
  ]);

  // Reference the project build.gradle
  config = withProjectBuildGradle(config, (newConfig) => {
    return appendContentsToConfig(newConfig, BUILDSCRIPT_LEVEL_GRADLE);
  });

  // Update app build.gradle
  config = withAppBuildGradle(config, (newConfig) => {
    return appendContentsToConfig(newConfig, APP_LEVEL_GRADLE);
  });

  // Add to the gradle properties
  config = withGradleProperties(config, (newConfig) => {
    const newProperties: AndroidConfig.Properties.PropertiesItem[] = [
      {
        type: "property",
        key: "expo.braze.fcmVersion",
        value: "23.0.0",
      },
      {
        type: "property",
        key: "expo.braze.addFirebaseMessaging",
        value: String(props.enableFirebaseCloudMessaging === true),
      },
    ]
    newProperties.map((gradleProperty) => newConfig.modResults.push(gradleProperty));
    return newConfig;
  });

  // Add AndroidManifest services
  config = withAndroidManifest(config, (newConfig) => {
    newConfig.modResults = addServices(newConfig.modResults);
    return newConfig;
  });

  return config;
};
