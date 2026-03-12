echo "Cleaning dependencies..."
rm -rf node_modules
rm -f package-lock.json

echo "Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
  echo "Legacy installation failed, retrying with force..."
  npm install --force
fi

echo "Running build..."
npm run build

echo "Build repair completed successfully."
