#!/bin/bash

echo ""
echo "============================================================================================================="
echo "⚠️ Valid firebase credentials are required to run this application since you are self-hosting the server. ⚠️"
echo " !!! PLEASE LOOK AT THE README FOR MORE DETAILS BEFORE PROCEEDING WITH THE SETUP !!! "
echo "============================================================================================================="
echo ""

cd "$(dirname "$0")"
ENV_FILE=".env"

# Require npm
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Require package.json
if [ ! -f "package.json" ]; then
    echo "❌ No package.json found in the current directory."
    exit 1
fi

# Cross-platform local IP detection
if command -v hostname &> /dev/null && hostname -I &> /dev/null; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
elif command -v ipconfig &> /dev/null; then
    # Windows or Git Bash fallback
    LOCAL_IP=$(ipconfig | grep -E "IPv4|IPv4 Address" | grep -v "169.254" | head -n 1 | awk -F: '{print $2}' | xargs)
fi

# Fallback to localhost if none found
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="127.0.0.1"
fi



# Load existing .env if available
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    echo ".env file found. If you want to keep existing existing .env variables, press enter when prompted for keys to keep existing values."
else
    echo "No .env file found. Creating a new one."
fi

prompt_optional() {
    local var_name="$1"
    local prompt_text="$2"
    local current_value="${!var_name}"

    read -p "$prompt_text [${current_value:+***}]: " input
    if [ -n "$input" ]; then
        eval "$var_name=\"\$input\""
    fi
}

# Prompt for all vars (none required)
prompt_optional EXPO_PUBLIC_FDA_API_KEY "Enter your FDA API key"
prompt_optional EXPO_PUBLIC_OPENAI_KEY "Enter your OpenAI API key"
prompt_optional EXPO_PUBLIC_FB_API_KEY "Enter your Firebase API key"
prompt_optional EXPO_PUBLIC_FB_AUTH_DOMAIN "Enter your Firebase Auth Domain"
prompt_optional EXPO_PUBLIC_FB_PROJECT_ID "Enter your Firebase Project ID"
prompt_optional EXPO_PUBLIC_FB_STORAGE_BUCKET "Enter your Firebase Storage Bucket"
prompt_optional EXPO_PUBLIC_FB_MESSAGING_SENDER "Enter your Firebase Messaging Sender ID"
prompt_optional EXPO_PUBLIC_FB_APP_ID "Enter your Firebase App ID"
prompt_optional EXPO_PUBLIC_MEASUREMENT_ID "Enter your Firebase Measurement ID"

# Prompt for local IP override
read -p "Detected local IP is $LOCAL_IP. Press ENTER to use it or type a different one: " LOCAL_IP_INPUT
FINAL_LOCAL_IP=${LOCAL_IP_INPUT:-$LOCAL_IP}

# Write to .env
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

# Install dependencies
echo "📦 Running npm install..."
npm install

# Start app
echo "🚀 Starting app with 'npm start'..."
npm start
