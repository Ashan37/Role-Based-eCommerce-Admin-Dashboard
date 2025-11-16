import express from "express";
const router = express.Router();

router.get("/admin/login", (req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Login</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          body{font-family:Arial,Helvetica,sans-serif;padding:30px;background:#f5f5f5}
          form{max-width:400px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
          h2{text-align:center;color:#333}
          label{display:block;margin-top:12px;margin-bottom:4px;font-weight:bold;color:#555}
          input,select{width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box}
          button{width:100%;padding:12px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;font-size:16px;margin-top:8px}
          button:hover{background:#0056b3}
          .role-info{font-size:12px;color:#666;margin-top:-8px;margin-bottom:12px}
        </style>
      </head>
      <body>
        <form id="login">
          <h2>Login</h2>
          
          <label for="role">Login As:</label>
          <select id="role" required>
            <option value="">-- Select Role --</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <div class="role-info" id="roleInfo"></div>
          
          <label for="email">Email:</label>
          <input id="email" type="email" placeholder="Enter your email" required />
          
          <label for="password">Password:</label>
          <input id="password" type="password" placeholder="Enter your password" required />
          
          <button type="submit">Sign in</button>
        </form>
        <div id="msg" style="color:red;margin-top:12px;text-align:center;font-weight:bold"></div>
        <script>
          const form = document.getElementById('login');
          const msg = document.getElementById('msg');
          const roleSelect = document.getElementById('role');
          const roleInfo = document.getElementById('roleInfo');
          const emailInput = document.getElementById('email');
          const passwordInput = document.getElementById('password');
          
          roleSelect.addEventListener('change', () => {
            const role = roleSelect.value;
            if (role === 'admin') {
              emailInput.value = 'admin@example.com';
              passwordInput.value = 'adminpass';
              roleInfo.textContent = 'Admin has full system access';
            } else if (role === 'user') {
              emailInput.value = 'user@example.com';
              passwordInput.value = 'userpass';
              roleInfo.textContent = 'User can access Products, Orders, Categories, OrderItems';
            } else {
              emailInput.value = '';
              passwordInput.value = '';
              roleInfo.textContent = '';
            }
          });
          
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            msg.textContent = '';
            
            const role = roleSelect.value;
            const email = emailInput.value;
            const password = passwordInput.value;
            
            console.log('Login form submitted:', email, 'Role:', role);
            
            if (!role) {
              msg.textContent = 'Please select a role (Admin or User)';
              return;
            }
            
            try {
              console.log('Sending login request...');
              const r = await fetch('/api/login', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ email, password, selectedRole: role }) 
              });
              
              console.log('Response status:', r.status);
              
              if (!r.ok) {
                const t = await r.json().catch(()=>({message:'login failed'}));
                console.error('Login failed:', t.message);
                msg.textContent = t.message || 'Login failed';
                return;
              }
              
              const data = await r.json();
              console.log('Login successful, redirecting to /admin...');
              
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

router.get("/admin/logout", (req, res) => {
  const cookieName = process.env.ADMIN_COOKIE_NAME || "adminToken";
  try {
    res.clearCookie(cookieName, { path: "/" });
  } catch (e) {}
  try {
    if (req.session) {
      req.session.admin = null;
      req.session.adminUser = null;
    }
  } catch (e) {}
  return res.redirect("/admin/login");
});

export default router;
