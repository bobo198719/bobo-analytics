---
description: Deploy Bobo Analytics to Hostinger VPS
---

This workflow automates the deployment of the backend and any frontend changes that need to be synced with the server.

1. Create a bundle of the backend code.
// turbo
2. Run the deployment script.
```powershell
.\deploy-vps.ps1
```

3. If prompted for a password, enter: `password-Princy@20201987`

// turbo
4. Verify the backend status.
```powershell
ssh root@srv1449576.hstgr.cloud "pm2 status"
```
