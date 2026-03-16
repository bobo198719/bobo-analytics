# Bobo Analytics - One Click Deploy to Hostinger
# This script bundles the backend and pushes it to the VPS

$VPS_IP = "srv1449576.hstgr.cloud"
$VPS_USER = "root"
$VPS_PASS = 'Princy@20201987'
$REMOTE_PATH = "/root/bobo-analytics/backend/"

$BACKEND_DIR = "backend"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ZIP_NAME = "backend_$Timestamp.tar.gz"

Write-Host "Preparing Backend Update..." -ForegroundColor Cyan

# Create a tar.gz of the backend (excluding node_modules)
Write-Host "Creating bundle $ZIP_NAME (excluding node_modules)..."
if (Test-Path $ZIP_NAME) { Remove-Item $ZIP_NAME -Force }

# Using tar.exe (built-in to modern Windows) to create a gzipped tarball
# We exclude node_modules using --exclude
tar.exe -czf $ZIP_NAME --exclude="node_modules" -C $BACKEND_DIR .

Write-Host "Uploading to VPS..."
# Using pscp with -batch and -hostkey to bypass fingerprint prompt
.\pscp.exe -batch -hostkey "ssh-ed25519 255 SHA256:ArgJxA/vyQ4U/ozwsF6FtdaR3mwE96TaoWIxP9/L1YI" -pw $VPS_PASS $ZIP_NAME "$($VPS_USER)@$($VPS_IP):$($REMOTE_PATH)backend_update.zip"
.\pscp.exe -batch -hostkey "ssh-ed25519 255 SHA256:ArgJxA/vyQ4U/ozwsF6FtdaR3mwE96TaoWIxP9/L1YI" -pw $VPS_PASS "$BACKEND_DIR\deploy_server.sh" "$($VPS_USER)@$($VPS_IP):$($REMOTE_PATH)deploy_server.sh"

Write-Host "Executing remote update..."
# Using plink with -batch and -hostkey to bypass fingerprint prompt
.\plink.exe -batch -hostkey "ssh-ed25519 255 SHA256:ArgJxA/vyQ4U/ozwsF6FtdaR3mwE96TaoWIxP9/L1YI" -pw $VPS_PASS "$($VPS_USER)@$($VPS_IP)" "bash $($REMOTE_PATH)deploy_server.sh"

Write-Host "Deployment Complete!" -ForegroundColor Green

# Cleanup
Remove-Item $ZIP_NAME -ErrorAction SilentlyContinue
