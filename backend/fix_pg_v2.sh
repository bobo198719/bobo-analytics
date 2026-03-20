sudo -u postgres psql -c "CREATE USER bobo WITH PASSWORD 'Princy@20201987';" || true
sudo -u postgres psql -c "ALTER USER bobo WITH PASSWORD 'Princy@20201987';"
sudo -u postgres psql -c "CREATE DATABASE restaurant_crm OWNER bobo;" || true
systemctl restart postgresql
