const {
  withAndroidManifest,
  withAppBuildGradle,
} = require("@expo/config-plugins");

// 1. Fungsi untuk merapikan Android Manifest (mengatasi Manifest Merger Error)
function withManifestReplace(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    if (!androidManifest.manifest.$) {
      androidManifest.manifest.$ = {};
    }
    androidManifest.manifest.$["xmlns:tools"] =
      "http://schemas.android.com/tools";

    const mainApplication = androidManifest.manifest.application[0];
    if (!mainApplication.$) {
      mainApplication.$ = {};
    }
    mainApplication.$["android:appComponentFactory"] =
      "androidx.core.app.CoreComponentFactory";
    mainApplication.$["tools:replace"] = "android:appComponentFactory";

    return config;
  });
}

// 2. Fungsi untuk menyuntikkan aturan eksklusi ke build.gradle (mengatasi Duplicate Class Error)
function withGradleExclusions(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      // Menyisipkan rule untuk membuang total library 'com.android.support' jadul yang bikin duplikat
      config.modResults.contents += `
\nconfigurations.all {
    exclude group: 'com.android.support'
}
`;
    }
    return config;
  });
}

// Menggabungkan kedua fungsi modifikasi native Android ke dalam satu plugin utama
module.exports = function withAndroidFixes(config) {
  return withGradleExclusions(withManifestReplace(config));
};
