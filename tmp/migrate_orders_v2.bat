@echo off
set VPS_PASS=Princy@20201987
plink.exe -batch -hostkey "ssh-ed25519 255 SHA256:ArgJxA/vyQ4U/ozwsF6FtdaR3mwE96TaoWIxP9/L1YI" -pw %VPS_PASS% root@srv1449576.hstgr.cloud "sudo -u postgres psql -d restaurant_crm -c \"ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending_waiter';\""
