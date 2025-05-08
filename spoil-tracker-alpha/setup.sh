#!/bin/bash

echo ""
echo "============================================================================================================="
echo "⚠️ Valid firebase credentials are required to run this application if you are self-hosting the server. ⚠️"
echo " !!! PLEASE LOOK AT THE README FOR MORE DETAILS BEFORE PROCEEDING WITH THE SETUP !!! "
echo "============================================================================================================="
echo ""

cd "$(dirname "$0")"
ENV_FILE=".env"

# 1) REQUIREMENTS CHECK
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ No package.json found in the current directory."
    exit 1
fi

# 2) DETECT LOCAL IP
if command -v hostname &> /dev/null && hostname -I &> /dev/null; then
    DETECTED_IP=$(hostname -I | awk '{print $1}')
elif command -v ipconfig &> /dev/null; then
    DETECTED_IP=$(ipconfig | grep -E "IPv4|IPv4 Address" | grep -v "169.254" | head -n 1 | awk -F: '{print $2}' | xargs)
fi
if [ -z "$DETECTED_IP" ]; then
    DETECTED_IP="127.0.0.1"
fi

# 3) LOAD EXISTING ENV
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    echo ".env loaded; pressing ENTER will keep existing (or default) values."
else
    echo "No .env file found—creating a new one."
fi

# 4) DEFAULT FIREBASE VALUES (replace these with your real defaults)
DEFAULT_FB_API_KEY="AIzaSyAMi2F5rIbNTApN_f7LmtIN1S2urd7W2MU"
DEFAULT_FB_AUTH_DOMAIN="example-spoiltracker.firebaseapp.com"
DEFAULT_FB_PROJECT_ID="example-spoiltracker"
DEFAULT_FB_STORAGE_BUCKET="example-spoiltracker.firebasestorage.app"
DEFAULT_FB_MESSAGING_SENDER="28950219541"
DEFAULT_FB_APP_ID="1:28950219541:web:89c0a5d7b45cea96fcf71c"
DEFAULT_MEASUREMENT_ID=""

# 5) SEED FB VARS FROM EXISTING OR DEFAULTS
EXPO_PUBLIC_FB_API_KEY=${EXPO_PUBLIC_FB_API_KEY:-$DEFAULT_FB_API_KEY}
EXPO_PUBLIC_FB_AUTH_DOMAIN=${EXPO_PUBLIC_FB_AUTH_DOMAIN:-$DEFAULT_FB_AUTH_DOMAIN}
EXPO_PUBLIC_FB_PROJECT_ID=${EXPO_PUBLIC_FB_PROJECT_ID:-$DEFAULT_FB_PROJECT_ID}
EXPO_PUBLIC_FB_STORAGE_BUCKET=${EXPO_PUBLIC_FB_STORAGE_BUCKET:-$DEFAULT_FB_STORAGE_BUCKET}
EXPO_PUBLIC_FB_MESSAGING_SENDER=${EXPO_PUBLIC_FB_MESSAGING_SENDER:-$DEFAULT_FB_MESSAGING_SENDER}
EXPO_PUBLIC_FB_APP_ID=${EXPO_PUBLIC_FB_APP_ID:-$DEFAULT_FB_APP_ID}
EXPO_PUBLIC_MEASUREMENT_ID=${EXPO_PUBLIC_MEASUREMENT_ID:-$DEFAULT_MEASUREMENT_ID}

# 6) PROMPT HELPER
prompt_optional() {
    local var_name="$1"
    local prompt_text="$2"
    local current_value="${!var_name}"
    read -p "$prompt_text [${current_value}]: " input
    if [ -n "$input" ]; then
        eval "$var_name=\"\$input\""
    fi
}

# 7) ALWAYS ASK FOR FDA & OPENAI KEYS
prompt_optional EXPO_PUBLIC_FDA_API_KEY "Enter your FDA API key"
prompt_optional EXPO_PUBLIC_OPENAI_KEY "Enter your OpenAI API key"

# 8) ASK IF THEY WANT THEIR OWN FIREBASE CONFIG
read -p "Do you want to configure your own Firebase project? [y/N]: " configure_fb
if [[ "$configure_fb" =~ ^[Yy] ]]; then
    echo "🔑 Enter your Firebase project credentials (press Enter to keep existing/default):"
    prompt_optional EXPO_PUBLIC_FB_API_KEY          "Firebase API key"
    prompt_optional EXPO_PUBLIC_FB_AUTH_DOMAIN      "Firebase Auth Domain"
    prompt_optional EXPO_PUBLIC_FB_PROJECT_ID       "Firebase Project ID"
    prompt_optional EXPO_PUBLIC_FB_STORAGE_BUCKET   "Firebase Storage Bucket"
    prompt_optional EXPO_PUBLIC_FB_MESSAGING_SENDER "Firebase Messaging Sender ID"
    prompt_optional EXPO_PUBLIC_FB_APP_ID           "Firebase App ID"
    prompt_optional EXPO_PUBLIC_MEASUREMENT_ID      "Firebase Measurement ID"

    # Prompt for local IP override
    read -p "Detected local IP is $DETECTED_IP. Press ENTER to use it or type a different one: " LOCAL_IP_INPUT
    FINAL_LOCAL_IP=${LOCAL_IP_INPUT:-$DETECTED_IP}
else
    echo "Using default Firebase project settings (no prompts)."
    echo "You will be connected to a public server. Please note that we cannot guarantee the integrity or availability of the server, so do not surrender anything confidential."
    FINAL_LOCAL_IP=""   # leave blank so client falls back to Render URL
fi

# 9) WRITE OUT .env
cat > "$ENV_FILE" <<EOL
EXPO_PUBLIC_LOCAL_IP=$FINAL_LOCAL_IP
EXPO_PUBLIC_FDA_API_KEY=$EXPO_PUBLIC_FDA_API_KEY
EXPO_PUBLIC_OPENAI_KEY=$EXPO_PUBLIC_OPENAI_KEY
EXPO_PUBLIC_FB_API_KEY=$EXPO_PUBLIC_FB_API_KEY
EXPO_PUBLIC_FB_AUTH_DOMAIN=$EXPO_PUBLIC_FB_AUTH_DOMAIN
EXPO_PUBLIC_FB_PROJECT_ID=$EXPO_PUBLIC_FB_PROJECT_ID
EXPO_PUBLIC_FB_STORAGE_BUCKET=$EXPO_PUBLIC_FB_STORAGE_BUCKET
EXPO_PUBLIC_FB_MESSAGING_SENDER=$EXPO_PUBLIC_FB_MESSAGING_SENDER
EXPO_PUBLIC_FB_APP_ID=$EXPO_PUBLIC_FB_APP_ID
EXPO_PUBLIC_MEASUREMENT_ID=$EXPO_PUBLIC_MEASUREMENT_ID
EOL

echo ".env file written to $ENV_FILE"

# 10) INSTALL & START
echo "📦 Running npm install..."
npm install

if [[ "$configure_fb" =~ ^[Yy] ]]; then
    echo "🚀 Starting app with 'npm start'..."
    npm start
else
    echo "🚀 Starting Expo with 'npx expo start'..."
    npx expo start
fi