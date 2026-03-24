import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    connectionLimit: 10
});

export async function GET({ request }) {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    try {
        const conn = await pool.getConnection();

        try {
            if (action === 'dashboard') {
                const [[totalResult]] = await conn.query("SELECT COUNT(*) as total FROM saas_users");
                const [[activeResult]] = await conn.query("SELECT COUNT(*) as active FROM saas_users WHERE status='active'");
                const [[revResult]] = await conn.query("SELECT SUM(amount) as revenue FROM payments");
                return new Response(JSON.stringify({
                    total: totalResult.total || 0,
                    active: activeResult.active || 0,
                    revenue: revResult.revenue || 0
                }));
            }

            if (action === 'users') {
                const [users] = await conn.query("SELECT id, business_name, username, industry, plan_type, status, created_at FROM saas_users ORDER BY created_at DESC");
                return new Response(JSON.stringify(users));
            }

            if (action === 'logins') {
                const [users] = await conn.query("SELECT id, username, industry, role, status, created_at FROM admin_users ORDER BY created_at DESC");
                return new Response(JSON.stringify(users));
            }

            if (action === 'plans') {
                const [plans] = await conn.query("SELECT * FROM plans");
                return new Response(JSON.stringify(plans));
            }

            if (action === 'revenue') {
                const [[revenue]] = await conn.query("SELECT SUM(amount) as total FROM payments");
                const [records] = await conn.query("SELECT p.*, u.business_name, u.plan_type FROM payments p JOIN saas_users u ON p.user_id=u.id ORDER BY p.created_at DESC");
                return new Response(JSON.stringify({ total: revenue.total || 0, records }));
            }

            if (action === 'leads') {
                const [leads] = await conn.query("SELECT * FROM leads ORDER BY created_at DESC");
                return new Response(JSON.stringify(leads));
            }

            if (action === 'security-alerts') {
                // login_logs table exists. Use it for alerts
                const [alerts] = await conn.query(`SELECT username, COUNT(*) as attempts FROM login_logs WHERE status = 'failed' AND created_at > NOW() - INTERVAL 1 HOUR GROUP BY username HAVING attempts > 5`);
                return new Response(JSON.stringify(alerts));
            }

            if (action === 'login-logs') {
                const [logs] = await conn.query("SELECT * FROM login_logs ORDER BY created_at DESC LIMIT 100");
                return new Response(JSON.stringify(logs));
            }

            return new Response(JSON.stringify([]));
        } finally {
            conn.release();
        }
    } catch (e) {
        console.error("Master DB Error:", e);
        return new Response(JSON.stringify([]), { status: 200 }); // Graceful fallback
    }
}

export async function POST({ request }) {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const body = await request.json();

    try {
        const conn = await pool.getConnection();

        try {
            if (action === 'update-status') {
                await conn.query("UPDATE saas_users SET status=? WHERE id=?", [body.status, body.userId]);
                return new Response(JSON.stringify({ success: true }));
            }
            if (action === 'suspend-user') {
                await conn.query("UPDATE admin_users SET status='suspended' WHERE id=?", [body.id]);
                return new Response(JSON.stringify({ success: true }));
            }
            if (action === 'delete-master-user') {
                await conn.query("DELETE FROM admin_users WHERE id=?", [body.id]);
                return new Response(JSON.stringify({ success: true }));
            }
            if (action === 'delete-user') {
                await conn.query("DELETE FROM saas_users WHERE id=?", [body.userId]);
                return new Response(JSON.stringify({ success: true }));
            }
            if (action === 'block-user') {
                await conn.query("UPDATE saas_users SET status = 'blocked' WHERE username = ?", [body.username]);
                return new Response(JSON.stringify({ success: true }));
            }
            if (action === 'manual-payment') {
                await conn.query("INSERT INTO payments (user_id, amount, method, status) VALUES (?, ?, ?, 'success')", [body.userId, body.amount, body.method]);
                await conn.query("UPDATE saas_users SET amount_paid = amount_paid + ? WHERE id=?", [body.amount, body.userId]);
                return new Response(JSON.stringify({ success: true }));
            }
            if (action === 'create-user') {
                const [result] = await conn.query(
                  "INSERT INTO saas_users (business_name, username, password_hash, industry, plan_type, status, created_at) VALUES (?, ?, 'managed_by_admin', ?, ?, 'active', NOW())",
                  [body.businessName, body.username, body.industry, body.planType]
                );
                await conn.query(
                  "INSERT INTO admin_users (username, password_hash, industry, role, status) VALUES (?, 'managed', ?, 'owner', 'active')",
                  [body.username, body.industry]
                );
                return new Response(JSON.stringify({ success: true, userId: result.insertId }));
            }

            return new Response(JSON.stringify({ success: false, error: 'Unknown Action'}));
        } finally {
            conn.release();
        }
    } catch(e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
