import os

app_gradle = "android/app/build.gradle"
if os.path.exists(app_gradle):
    with open(app_gradle, "r", encoding="utf-8") as f:
        content = f.read()

    signing_block = """
    signingConfigs {
        release {
            if (project.hasProperty('RELEASE_STORE_FILE')) {
                storeFile file(RELEASE_STORE_FILE)
                storePassword RELEASE_STORE_PASSWORD
                keyAlias RELEASE_KEY_ALIAS
                keyPassword RELEASE_KEY_PASSWORD
                v1SigningEnabled true
                v2SigningEnabled true
            }
        }
    }
"""

    if "signingConfigs {" not in content:
        content = content.replace("buildTypes {", signing_block + "\n    buildTypes {")
        content = content.replace("buildTypes {\n        release {", "buildTypes {\n        release {\n            signingConfig signingConfigs.release")
        with open(app_gradle, "w", encoding="utf-8") as f:
            f.write(content)
        print("Berhasil mengonfigurasi release signingConfig di android/app/build.gradle")
    else:
        print("signingConfigs sudah ada di android/app/build.gradle")
