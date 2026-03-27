import menuItems from '../../data/restaurant_menu.json';

// 🔐 MASTER USER REGISTRY (Emergency Recovery V62)
const RECOVERY_USERS = [
    { id: 68,  username: 'admin',          email: null,               plain_password: 'password123', business_name: 'SaaS Master Console', industry: 'admin',      plan_type: 'enterprise', status: 'active', created_at: '2026-03-18T00:00:00Z' },
    { id: 74,  username: 'admin@bobo.com', email: 'admin@bobo.com',   plain_password: 'password123', business_name: 'Bobo Master Admin',   industry: 'admin',      plan_type: 'enterprise', status: 'active', created_at: '2026-03-18T00:00:00Z' },
    { id: 81,  username: 'bake',           email: null,               plain_password: 'bake',         business_name: 'Bake Shop',           industry: 'bakery',     plan_type: 'trial',      status: 'active', created_at: '2026-03-20T00:00:00Z' },
    { id: 82,  username: 'groc test',      email: null,               plain_password: 'groc test',    business_name: 'Groc Test',           industry: 'grocery',    plan_type: 'trial',      status: 'active', created_at: '2026-03-20T00:00:00Z' },
    { id: 83,  username: 'grocery',        email: null,               plain_password: 'bobo123',      business_name: 'Grocery Store',       industry: 'grocery',    plan_type: 'trial',      status: 'active', created_at: '2026-03-20T00:00:00Z' },
    { id: 84,  username: 'gros test',      email: null,               plain_password: 'gros test',    business_name: 'Gros Test',           industry: 'grocery',    plan_type: 'trial',      status: 'active', created_at: '2026-03-20T00:00:00Z' },
    { id: 85,  username: 'pharma123',      email: null,               plain_password: 'pharma123',    business_name: 'Pharma 123',          industry: 'pharmacy',   plan_type: 'trial',      status: 'active', created_at: '2026-03-21T00:00:00Z' },
    { id: 86,  username: 'pharmatest',     email: null,               plain_password: 'pharmatest',   business_name: 'Pharma Test',         industry: 'pharmacy',   plan_type: 'trial',      status: 'active', created_at: '2026-03-21T00:00:00Z' },
    { id: 79,  username: 'rest_admin',     email: null,               plain_password: 'password123',  business_name: 'Restaurant Admin',    industry: 'restaurant', plan_type: 'enterprise', status: 'active', created_at: '2026-03-22T00:00:00Z' },
    { id: 87,  username: 'trivia',         email: null,               plain_password: 'bobo2026',     business_name: 'Trivia Bakes',        industry: 'bakery',     plan_type: 'trial',      status: 'active', created_at: '2026-03-22T00:00:00Z' },
    { id: 75,  username: 'pharmacy_admin', email: null,               plain_password: 'password123',  business_name: 'City Pharmacy',       industry: 'pharmacy',   plan_type: 'enterprise', status: 'active', created_at: '2026-03-16T00:00:00Z' },
    { id: 76,  username: 'health_admin',   email: null,               plain_password: 'password123',  business_name: 'Apollo Hospital',     industry: 'healthcare', plan_type: 'pro',        status: 'active', created_at: '2026-03-16T00:00:00Z' },
    { id: 77,  username: 'retail_admin',   email: null,               plain_password: 'password123',  business_name: 'Big Bazaar',          industry: 'retail',     plan_type: 'enterprise', status: 'active', created_at: '2026-03-16T00:00:00Z' },
    { id: 78,  username: 'baker_admin',    email: null,               plain_password: 'password123',  business_name: 'Trivia Bakes Admin',  industry: 'bakery',     plan_type: 'pro',        status: 'active', created_at: '2026-03-16T00:00:00Z' },
];

// 🕵️ AUDIT LOG REGISTRY
const AUTH_LOGS = [];

// 📝 ONBOARDING LEADS ENGINE (Memory Store for VPS bypass)
const PENDING_LEADS = [];

// 📧 EMAIL CAMPAIGN HISTORY
const EMAIL_HISTORY = [];

export async function ALL({ request, params }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // Only intercept paths that should go to the Hostinger API
    if (!pathname.includes('/api/') || pathname.includes('/api/v2/')) {
        return undefined;
    }

    // 🔥 EMERGENCY AUTH BYPASS (V60 - Early Exit Signal)
    if (pathname.includes('/auth/login') && method === 'POST') {
        try {
            const body = JSON.parse(await request.clone().text());
            if ((body.email === 'admin@bobo.com' || body.username === 'admin') && body.password === 'password123') {
                return new Response(JSON.stringify({ 
                    success: true,
                    token: "EMERGENCY_RECOVERY_KEY_V62",
                    user: { id: 1, name: "Admin Master", email: "admin@bobo.com", role: "admin", industry: "admin" }
                }), { status: 200, headers: {'Content-Type': 'application/json'} });
            }
        } catch(e) { /* continue to proxy */ }
    }

    // 🛡️ ADMIN USERS BYPASS (V62 - Always return from registry)
    if (pathname.includes('/admin/users') && method === 'GET') {
        try {
            // Try live VPS first (5s timeout)
            const liveRes = await fetch(`http://187.124.97.144:5000${pathname}${url.search}`, {
                headers: { 'Content-Type': 'application/json', 'Authorization': request.headers.get('Authorization') || '' },
                signal: AbortSignal.timeout(5000)
            });
            const text = await liveRes.text();
            if (!text.includes('<!DOCTYPE') && liveRes.ok) {
                const liveData = JSON.parse(text);
                if (Array.isArray(liveData) && liveData.length > 0) {
                    return new Response(JSON.stringify(liveData), { status: 200, headers: {'Content-Type': 'application/json'} });
                }
            }
        } catch(e) { /* VPS offline, use recovery */ }
        // Return recovery registry
        return new Response(JSON.stringify(RECOVERY_USERS), { status: 200, headers: {'Content-Type': 'application/json'} });
    }

    // 🛡️ RESET PASSWORD BYPASS — forward to VPS or acknowledge (V62)
    if (pathname.includes('/admin/reset-password') && method === 'POST') {
        try {
            const bodyText = await request.text();
            const bodyObj  = JSON.parse(bodyText);
            // Try live VPS first
            try {
                const liveRes = await fetch(`http://187.124.97.144:5000${pathname}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': request.headers.get('Authorization') || '' },
                    body: bodyText,
                    signal: AbortSignal.timeout(5000)
                });
                if (liveRes.ok) {
                    const data = await liveRes.json();
                    return new Response(JSON.stringify(data), { status: 200, headers: {'Content-Type': 'application/json'} });
                }
            } catch(e) { /* offline */ }
            // Update recovery registry in memory
            const target = RECOVERY_USERS.find(u => String(u.id) === String(bodyObj.userId));
            if (target) target.plain_password = bodyObj.newPassword;
            return new Response(JSON.stringify({ success: true, message: 'Password updated (recovery mode)' }), { status: 200, headers: {'Content-Type': 'application/json'} });
        } catch(e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
        }
    }

    // 🛡️ UPDATE STATUS (Suspend / Activate) — recovery handler
    if (pathname.includes('/admin/update-status') && method === 'POST') {
        try {
            const bodyText = await request.text();
            const bodyObj  = JSON.parse(bodyText);
            try {
                const liveRes = await fetch(`http://187.124.97.144:5000${pathname}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': request.headers.get('Authorization') || '' },
                    body: bodyText, signal: AbortSignal.timeout(5000)
                });
                if (liveRes.ok) { const d = await liveRes.json(); return new Response(JSON.stringify(d), { status: 200, headers: {'Content-Type': 'application/json'} }); }
            } catch(e) { /* offline */ }
            const u = RECOVERY_USERS.find(u => String(u.id) === String(bodyObj.userId));
            if (u) u.status = bodyObj.status;
            return new Response(JSON.stringify({ success: true }), { status: 200, headers: {'Content-Type': 'application/json'} });
        } catch(e) { return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} }); }
    }

    // 🛡️ UPDATE PLAN (Upgrade / Downgrade) — recovery handler
    if (pathname.includes('/admin/update-plan') && method === 'POST') {
        try {
            const bodyText = await request.text();
            const bodyObj  = JSON.parse(bodyText);
            try {
                const liveRes = await fetch(`http://187.124.97.144:5000${pathname}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': request.headers.get('Authorization') || '' },
                    body: bodyText, signal: AbortSignal.timeout(5000)
                });
                if (liveRes.ok) { const d = await liveRes.json(); return new Response(JSON.stringify(d), { status: 200, headers: {'Content-Type': 'application/json'} }); }
            } catch(e) { /* offline */ }
            const u = RECOVERY_USERS.find(u => String(u.id) === String(bodyObj.userId));
            if (u) u.plan_type = bodyObj.planType;
            return new Response(JSON.stringify({ success: true }), { status: 200, headers: {'Content-Type': 'application/json'} });
        } catch(e) { return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} }); }
    }

    // 🛡️ DELETE USER — recovery handler
    if (pathname.includes('/admin/delete-user') && method === 'POST') {
        try {
            const bodyText = await request.text();
            const bodyObj  = JSON.parse(bodyText);
            try {
                const liveRes = await fetch(`http://187.124.97.144:5000${pathname}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': request.headers.get('Authorization') || '' },
                    body: bodyText, signal: AbortSignal.timeout(5000)
                });
                if (liveRes.ok) { const d = await liveRes.json(); return new Response(JSON.stringify(d), { status: 200, headers: {'Content-Type': 'application/json'} }); }
            } catch(e) { /* offline */ }
            const idx = RECOVERY_USERS.findIndex(u => String(u.id) === String(bodyObj.userId));
            if (idx > -1) RECOVERY_USERS.splice(idx, 1);
            return new Response(JSON.stringify({ success: true }), { status: 200, headers: {'Content-Type': 'application/json'} });
        } catch(e) { return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} }); }
    }

    // 🛡️ SEND PROMO — Edge Dispatch (Native NodeMailer capability)
    if (pathname.includes('/admin/send-promo') && method === 'POST') {
        try {
            const bodyText = await request.text();
            
            // Try Live VPS First
            try {
                const liveRes = await fetch(`http://187.124.97.144:5000${pathname}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': request.headers.get('Authorization') || '' },
                    body: bodyText, signal: AbortSignal.timeout(5000)
                });
                if (liveRes.ok) { const d = await liveRes.json(); return new Response(JSON.stringify(d), { status: 200, headers: {'Content-Type': 'application/json'} }); }
            } catch(e) { /* offline -> handle locally */ }

            // ⚡ SERVERLESS EDGE DISPATCH
            const { targetType, targetValue, channels, subject, message, scheduledAt } = JSON.parse(bodyText);
            const safeSubject = subject || "Secure Update from Bobo Analytics 🚀";
            const nodemailer = await import("nodemailer");

            let emailCount = 0; let waCount = 0; let smsCount = 0;
            const campId = "C_" + Math.random().toString(36).substr(2, 9);
            
            // Collect targets from recovery array
            let users = [];
            if (targetType === 'user') { users = RECOVERY_USERS.filter(u => String(u.id) === String(targetValue)); }
            else if (targetType === 'multiple') { users = RECOVERY_USERS.filter(u => targetValue.includes(String(u.id)) || targetValue.includes(u.id)); }
            else if (targetType === 'industry') { users = RECOVERY_USERS.filter(u => u.industry === targetValue); }
            else { users = RECOVERY_USERS; }

            const mailTransporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.hostinger.com", port: parseInt(process.env.SMTP_PORT || "465", 10), secure: true,
                auth: { user: process.env.SMTP_USER || "support@boboanalytics.com", pass: process.env.SMTP_PASS || "" }
            });

            const twilioSid = process.env.TWILIO_ACCOUNT_SID;
            const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
            const twilioFrom = process.env.TWILIO_PHONE_NUMBER || "+15017122661"; // Valid Twilio from-number

            if (!scheduledAt) {
                for (const u of users) {
                    const toPhone = /^\\+?[0-9]{10,15}$/.test(u.username) ? (u.username.startsWith('+') ? u.username : '+' + u.username) : null;
                const toEmail = u.email || (u.username.includes('@') ? u.username : null);

                // 1. Email (support@)
                if (channels.includes('email') && toEmail && process.env.SMTP_PASS) {
                    try {
                        let trackedHtml = message.replace(/\\n/g, '<br>');
                        trackedHtml = trackedHtml.replace(/href="([^"]*)"/g, 'href="https://boboanalytics.com/api/track/click/' + campId + '?url=$1"');
                        trackedHtml += `<br><br><small>Sent officially via Bobo Analytics Support Engine</small>`;
                        trackedHtml += `<img src="https://boboanalytics.com/api/track/open/${campId}" width="1" height="1" style="display:none;" />`;

                        await mailTransporter.sendMail({
                            from: '"Bobo Analytics" <support@boboanalytics.com>', to: toEmail,
                            subject: safeSubject,
                            html: `<div style="font-family:sans-serif;">${trackedHtml}</div>`
                        });
                        emailCount++;
                    } catch(e) { console.error("Edge Email Error:", e); }
                }

                // 2. WhatsApp (+91 9518525420)
                if (channels.includes('whatsapp') && process.env.WHATSAPP_API_TOKEN && toPhone) {
                    try {
                        const waPhoneId = process.env.WA_PHONE_ID || "wa_id";
                        await fetch(`https://graph.facebook.com/v17.0/${waPhoneId}/messages`, {
                            method: "POST", headers: { "Authorization": `Bearer ${process.env.WHATSAPP_API_TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({ messaging_product: "whatsapp", to: toPhone, type: "text", text: { body: message } })
                        }).catch(()=>{});
                        waCount++;
                    } catch(e){ console.error("Edge WA Error:", e); }
                }

                // 3. SMS (Twilio Default)
                if (channels.includes('sms') && twilioSid && twilioAuth && toPhone) {
                    try {
                        const formData = new URLSearchParams();
                        formData.append('To', toPhone);
                        formData.append('From', twilioFrom);
                        formData.append('Body', message);

                        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Authorization': 'Basic ' + Buffer.from(twilioSid + ':' + twilioAuth).toString('base64')
                            },
                            body: formData.toString()
                        }).catch(()=>{});
                        smsCount++;
                    } catch(e) { console.error("Edge SMS Error:", e); }
                }
            }
            } // end if !scheduledAt
            
            EMAIL_HISTORY.unshift({ 
                id: campId,
                time: new Date().toISOString(), 
                subject: safeSubject, 
                message: message, 
                targetRoute: targetType === 'user' ? 'Specific Client' : (targetType === 'multiple' ? 'Custom Segment' : targetType.toUpperCase()), 
                channels, 
                recipients: scheduledAt ? 'scheduled' : users.length,
                status: scheduledAt ? 'scheduled' : 'sent',
                opened: 0,
                clicks: 0
            });
            if(EMAIL_HISTORY.length > 50) EMAIL_HISTORY.pop();

            return new Response(JSON.stringify({ 
                success: true, 
                message: `Edge Dispatch processed: ${emailCount} Emails, ${waCount} WhatsApps, ${smsCount} SMS.` 
            }), { status: 200, headers: {'Content-Type': 'application/json'} });
        } catch(e) { return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} }); }
    }

    // ==========================================
    // 🛡️ EDGE-ONLY CONTROLLERS (Bypass Live VPS)
    // ==========================================
    
    // CAMPAIGN TRACKING: PIXEL & CLICKS
    if (pathname.startsWith('/track/open/')) {
        const id = pathname.replace('/track/open/', '');
        const c = EMAIL_HISTORY.find(x => x.id === id);
        if(c) c.opened++;
        const pixelParams = { status: 200, headers: {'Content-Type': 'image/gif', 'Cache-Control': 'no-store, no-cache, must-revalidate, private'} };
        const pixelBuf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        return new Response(pixelBuf, pixelParams);
    }

    if (pathname.startsWith('/track/click/')) {
        const id = pathname.replace('/track/click/', '');
        const c = EMAIL_HISTORY.find(x => x.id === id);
        if(c) c.clicks++;
        const redirectUrl = url.searchParams.get('url') || 'https://boboanalytics.com';
        return Response.redirect(redirectUrl, 302);
    }

    // INTERCEPT AUDIT LOGS
    if (pathname.includes('/admin/audit-logs')) {
        return new Response(JSON.stringify(AUTH_LOGS), { status: 200, headers: {'Content-Type': 'application/json'} });
    }

    // CAMPAIGN HISTORY
    if (pathname.includes('/admin/campaigns')) {
        return new Response(JSON.stringify(EMAIL_HISTORY), { status: 200, headers: {'Content-Type': 'application/json'} });
    }

    // 🚀 CLIENT ONBOARDING & PIPELINE ENGINE
    if (pathname.includes('/lead') && method === 'POST') {
        const body = await request.text();
        const lead = JSON.parse(body);
        lead.id = "L_" + Math.random().toString(36).substr(2, 9);
        lead.status = "pending";
        lead.created_at = new Date().toISOString();
        PENDING_LEADS.unshift(lead);
        
        // Background Admin Notification
        if (process.env.SMTP_PASS) {
            import("nodemailer").then(mail => {
                const m = mail.createTransport({ host: process.env.SMTP_HOST || "smtp.hostinger.com", port: 465, secure: true, auth: { user: process.env.SMTP_USER || "support@boboanalytics.com", pass: process.env.SMTP_PASS } });
                m.sendMail({ from: '"Bobo System" <support@boboanalytics.com>', to: "support@boboanalytics.com", subject: "New SaaS Tenant Lead: " + lead.businessName, text: JSON.stringify(lead, null, 2) }).catch(()=>{});
            });
        }
        return new Response(JSON.stringify({ success: true, leadId: lead.id }), { status: 200, headers: {'Content-Type': 'application/json'} });
    }
    
    if (pathname.includes('/admin/leads') && method === 'GET') {
        return new Response(JSON.stringify(PENDING_LEADS), { status: 200, headers: {'Content-Type': 'application/json'} });
    }

    if (pathname.includes('/admin/approve-lead') && method === 'POST') {
        const body = await request.text();
        const { leadId } = JSON.parse(body);
        const leadIdx = PENDING_LEADS.findIndex(l => l.id === leadId);
        if (leadIdx === -1) return new Response(JSON.stringify({ success: false, error: "Lead not found" }), { status: 404, headers: {'Content-Type': 'application/json'} });
        
        const lead = PENDING_LEADS[leadIdx];
        const password = Math.random().toString(36).slice(-8) + "X!";
        
        // Create user in registry
        const newUser = {
            id: Math.floor(Math.random() * 1000) + 100,
            username: lead.phone || lead.email.split('@')[0],
            email: lead.email,
            plain_password: password,
            business_name: lead.businessName,
            industry: lead.industry,
            plan_type: 'trial',
            status: 'active',
            created_at: new Date().toISOString()
        };
        RECOVERY_USERS.push(newUser);
        
        lead.status = "approved";
        PENDING_LEADS[leadIdx] = lead; // Update status in leads db

        // Send Official Login Credentials
        if (process.env.SMTP_PASS) {
            const mail = await import("nodemailer");
            const m = mail.createTransport({ host: process.env.SMTP_HOST || "smtp.hostinger.com", port: 465, secure: true, auth: { user: process.env.SMTP_USER || "support@boboanalytics.com", pass: process.env.SMTP_PASS } });
            await m.sendMail({ 
                from: '"Bobo Analytics" <support@boboanalytics.com>', 
                to: lead.email, 
                subject: "Welcome to Bobo Analytics! 🚀 Your Infrastructure is Ready.", 
                html: `
                    <div style="font-family:sans-serif; padding: 20px;">
                        <h2>Your Infrastructure is Secure and Ready</h2>
                        <p>Hello ${lead.ownerName}, your application for <strong>${lead.businessName}</strong> has been officially approved.</p>
                        <p>Here are your secure master credentials to access the portal:</p>
                        <div style="background:#f4f4f4; padding:15px; border-radius:8px;">
                            <p><strong>Email / Login ID:</strong> ${lead.email}</p>
                            <p><strong>Temporary Password:</strong> ${password}</p>
                        </div>
                        <br>
                        <p><a href="https://boboanalytics.com/" style="background:#3b82f6;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">Access Secure Panel</a></p>
                        <br>
                        <p>For security, please change your password instantly after logging in.</p>
                    </div>
                ` 
            }).catch(e => console.error("Lead Error Mail:", e));
        }

        return new Response(JSON.stringify({ success: true, message: "Lead Approved & User Provisioned" }), { status: 200, headers: {'Content-Type': 'application/json'} });
    }
    // ==========================================

    const hostingerUrl = "http://187.124.97.144:5000";
    let targetPath = pathname + url.search;
    
    const assetFolders = ['/storage/', '/menu-images/'];
    for (const folder of assetFolders) {
        if (targetPath.startsWith('/api' + folder)) {
            targetPath = targetPath.replace('/api/', '/');
            break;
        }
    }

    try {
        const fetchOptions = {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || ''
            },
            ...(method !== 'GET' && method !== 'HEAD' ? { body: await request.text() } : {})
        };

        const isSeed = pathname.includes('/seed');
        const timeoutMs = isSeed ? 60000 : 8000;

        const resProxy = await fetch(`${hostingerUrl}${targetPath}`, {
            ...fetchOptions,
            signal: AbortSignal.timeout(timeoutMs)
        });

        // 🖼️ BINARY ASSET SHIELD
        const contentType = resProxy.headers.get('Content-Type') || '';
        if (contentType.includes('image/') || contentType.includes('video/') || contentType.includes('application/pdf') || contentType.includes('octet-stream')) {
            const blob = await resProxy.arrayBuffer();
            return new Response(blob, {
                status: resProxy.status,
                headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' }
            });
        }

        // 🕵️ JSON DETECTION: Prevent "Unexpected token <" crash
        const responseText = await resProxy.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            if (resProxy.status >= 400) {
                throw new Error(`Backend Error ${resProxy.status}: ${responseText.substring(0, 50)}`);
            }
            if (responseText.includes('<!DOCTYPE')) {
                throw new Error("SECURE_NODE_JSON_MISMATCH: HTML received instead of JSON.");
            }
            data = { message: responseText };
        }
        
        if (pathname.includes('/api/settings') && typeof data === 'string') {
            try { data = JSON.parse(data); } catch(e) {}
        }
        
        // 📝 LOG AUTHENTICATION ATTEMPTS FOR AUDIT
        if (pathname.includes('/auth/login') && method === 'POST') {
            const cloneReq = request.clone();
            const body = await cloneReq.text();
            let parsed = {}; try { parsed = JSON.parse(body); } catch(e){}
            const email = parsed.email || parsed.username || "Unknown";
            
            if (resProxy.status === 200 || resProxy.status === 201) {
                AUTH_LOGS.unshift({ time: new Date().toISOString(), user: email, status: 'Success', error: null });
            } else if (resProxy.status >= 400) {
                let errStr = "Invalid Credentials";
                try { const r = JSON.parse(responseText); errStr = r.error || r.message || statusCode; } catch(e){}
                AUTH_LOGS.unshift({ time: new Date().toISOString(), user: email, status: 'Failed', error: errStr });
            }
            if (AUTH_LOGS.length > 100) AUTH_LOGS.pop(); // keep last 100
        }

        return new Response(JSON.stringify(data), { 
            status: resProxy.status, 
            headers: {'Content-Type': 'application/json'} 
        });

    } catch (err) {
        // 🆘 EMERGENCY CLOUD RECOVERY SHIELD (V62)
        
        if (pathname.includes('/tables')) {
            return new Response(JSON.stringify([
                {id: 1, table_number: '1', status: 'available'},
                {id: 2, table_number: '2', status: 'available'}
            ]), { status: 200, headers: {'Content-Type': 'application/json'} });
        }
        const getPlanRev = (plan) => {
            if(plan === 'enterprise') return 4999;
            if(plan === 'pro') return 2499;
            return 0; // Trial or undefined
        };

        if (pathname.includes('/stats')) {
            const totalRev = RECOVERY_USERS.reduce((acc, u) => acc + getPlanRev(u.plan_type), 0);
            return new Response(JSON.stringify({ 
                users: RECOVERY_USERS.length, 
                active: RECOVERY_USERS.filter(u => u.status === 'active').length, 
                revenue: totalRev 
            }), { status: 200, headers: {'Content-Type': 'application/json'} });
        }

        if (pathname.includes('/tenants')) {
            return new Response(JSON.stringify(
                RECOVERY_USERS.map(u => ({ name: u.business_name || u.username, industry: u.industry, status: u.status, revenue: getPlanRev(u.plan_type) }))
            ), { status: 200, headers: {'Content-Type': 'application/json'} });
        }

        return new Response(JSON.stringify({ 
            success: false, 
            error: "VPS_OFFLINE_V62", 
            message: err.message,
            timestamp: new Date().toISOString()
        }), { status: 503, headers: {'Content-Type': 'application/json'} });
    }
}
