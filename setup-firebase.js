/**
 * PDC Personality Development Club — Firebase Quick Configurator
 * Run: node setup-firebase.js
 * 
 * This script allows you to easily paste your new Firebase configuration
 * and automatically updates .env and js/content.js.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\n=======================================================");
console.log("   PDC Assessment — Firebase Configuration Wizard");
console.log("=======================================================\n");
console.log("Please paste your Firebase configuration keys from Firebase Console:");
console.log("(Project Settings -> General -> Your apps -> Web app)\n");

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const apiKey = (await ask("apiKey: ")).trim();
  const projectId = (await ask("projectId: ")).trim();
  const authDomain = (await ask(`authDomain (default: ${projectId}.firebaseapp.com): `)).trim() || `${projectId}.firebaseapp.com`;
  const storageBucket = (await ask(`storageBucket (default: ${projectId}.firebasestorage.app): `)).trim() || `${projectId}.firebasestorage.app`;
  const messagingSenderId = (await ask("messagingSenderId: ")).trim();
  const appId = (await ask("appId: ")).trim();

  if (!apiKey || !projectId) {
    console.error("\n❌ Error: apiKey and projectId are required.");
    rl.close();
    return;
  }

  // 1. Update .env
  const envContent = `# PDC Personality Development Club — Environment Configuration
PDC_FIREBASE_API_KEY=${apiKey}
PDC_FIREBASE_AUTH_DOMAIN=${authDomain}
PDC_FIREBASE_PROJECT_ID=${projectId}
PDC_FIREBASE_STORAGE_BUCKET=${storageBucket}
PDC_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
PDC_FIREBASE_APP_ID=${appId}

# WhatsApp Official Community URL
PDC_WHATSAPP_COMMUNITY_URL=https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl

# Kondhwa Campus Assessment URL
PDC_KONDHWA_QUIZ_URL=kondhwa.html
`;

  fs.writeFileSync(path.join(__dirname, ".env"), envContent, "utf8");
  console.log("\n✅ Updated .env file successfully.");

  // 2. Update js/content.js
  const contentPath = path.join(__dirname, "js", "content.js");
  let contentJs = fs.readFileSync(contentPath, "utf8");

  const newFirebaseBlock = `  // ── Firebase Configuration for PDC Project ───────────────────────
  firebase: {
    apiKey: "${apiKey}",
    authDomain: "${authDomain}",
    projectId: "${projectId}",
    storageBucket: "${storageBucket}",
    messagingSenderId: "${messagingSenderId}",
    appId: "${appId}"
  },`;

  contentJs = contentJs.replace(
    /\/\/\s*── Firebase Configuration Placeholder for PDC Project[\s\S]*?appId:\s*"[^"]*"\s*\n\s*\},/,
    newFirebaseBlock
  );

  fs.writeFileSync(contentPath, contentJs, "utf8");
  console.log("✅ Updated js/content.js with new Firebase credentials.");

  console.log("\n=======================================================");
  console.log("🎉 Setup complete! Your PDC assessment is now connected to:");
  console.log(`   Project ID: ${projectId}`);
  console.log("=======================================================\n");

  rl.close();
}

main().catch(err => {
  console.error("Configuration failed:", err);
  rl.close();
});
