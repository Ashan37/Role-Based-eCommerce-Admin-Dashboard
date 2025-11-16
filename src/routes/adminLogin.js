import express from "express";
const router = express.Router();

// Simple admin login page (dev convenience)
router.get("/admin/login", (req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Admin Login</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          body{font-family:Arial,Helvetica,sans-serif;padding:30px}
          form{max-width:400px;margin:0 auto}
          input{width:100%;padding:8px;margin:8px 0}
          button{padding:8px 12px}
        </style>
      </head>
      <body>
        <h2>Admin Login</h2>
        <form id="login">
          <input id="email" type="email" placeholder="email" value="admin@example.com" required />
          <input id="password" type="password" placeholder="password" value="adminpass" required />
          <button type="submit">Sign in</button>
        </form>
        <div id="msg" style="color:red;margin-top:12px"></div>
        <script>
          const form = document.getElementById('login');
          const msg = document.getElementById('msg');
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            msg.textContent = '';
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
              const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
              if (!r.ok) {
                const t = await r.json().catch(()=>({message:'login failed'}));
                msg.textContent = t.message || 'Login failed';
                return;
              }
              // successful — server sets cookie; redirect to admin
              window.location.href = '/admin';
            } catch (err) {
              msg.textContent = err.message || 'Network error';
            }
          });
        </script>
      </body>
    </html>
  `);
});

export default router;
