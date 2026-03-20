@echo off
set VPS_PASS=Princy@20201987
plink.exe -batch -hostkey "ssh-ed25519 255 SHA256:ArgJxA/vyQ4U/ozwsF6FtdaR3mwE96TaoWIxP9/L1YI" -pw %VPS_PASS% root@srv1449576.hstgr.cloud "sudo -u postgres psql -c \"CREATE USER bobo WITH PASSWORD 'Princy@20201987';\" ; sudo -u postgres psql -c \"ALTER USER bobo WITH PASSWORD 'Princy@20201987';\" ; sudo -u postgres psql -c \"CREATE DATABASE restaurant_crm OWNER bobo;\" ; systemctl restart postgresql"
