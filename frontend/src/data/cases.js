export const CASES = [
  {
    "id": "CCS-001",
    "title": "The Login Disaster",
    "category": "JavaScript",
    "difficulty": "Rookie",
    "duration": "8 min",
    "xp": 120,
    "accent": "amber",
    "summary": "Users with the correct password are being rejected at the door.",
    "incident": "At 09:07, support received 47 reports that valid users could not sign in. The authentication service is up; the failure appears to be in a small conditional.",
    "environment": "Node.js · Authentication service · JavaScript",
    "evidence": [
      {
        "type": "LOG",
        "title": "Authentication log",
        "content": "09:07:12 login_attempt user=maya\n09:07:12 password_check=match\n09:07:12 response=401 Login failed",
        "detail": "The password comparison reports a match, but the response is still a rejection."
      },
      {
        "type": "CODE",
        "title": "auth.js · line 14",
        "content": "if (password === savedPassword) {\n  return { ok: false, message: 'Login failed' };\n}\nreturn { ok: true, message: 'Welcome back' };",
        "detail": "Trace the branch that runs when the passwords are equal."
      },
      {
        "type": "TEST",
        "title": "Reproduction steps",
        "content": "Input password: sunflower42\nStored demo password: sunflower42\nExpected: Login succeeds\nActual: Login failed",
        "detail": "The failure is reproducible with matching values."
      }
    ],
    "hypotheses": [
      {
        "id": "h1",
        "label": "The condition is reversed",
        "desc": "A matching password enters the failure branch."
      },
      {
        "id": "h2",
        "label": "The server is offline",
        "desc": "The request cannot reach the authentication service."
      },
      {
        "id": "h3",
        "label": "The password is too short",
        "desc": "The validator rejects passwords under a length limit."
      }
    ],
    "diagnosis": "The condition is reversed: equality currently triggers the failure response.",
    "solution": "Change the condition so that a mismatch returns the failure response.",
    "lesson": "Conditions control which branch runs. Read a conditional as: “If this is true, do this.” For real authentication, never compare plaintext passwords—use a trusted password-hashing library.",
    "starterCode": "function checkPassword(password, savedPassword) {\n  if (password === savedPassword) {\n    return { ok: false, message: 'Login failed' };\n  }\n  return { ok: true, message: 'Welcome back' };\n}",
    "fixedCode": "function checkPassword(password, savedPassword) {\n  if (password !== savedPassword) {\n    return { ok: false, message: 'Login failed' };\n  }\n  return { ok: true, message: 'Welcome back' };\n}",
    "testLabels": [
      "Matching password should succeed",
      "Wrong password should fail",
      "Function returns a result"
    ]
  },
  {
    "id": "CCS-002",
    "title": "The Vanishing Records",
    "category": "Databases",
    "difficulty": "Rookie",
    "duration": "10 min",
    "xp": 140,
    "accent": "cyan",
    "summary": "A report says there are no orders, even though the database is full of them.",
    "incident": "The morning sales dashboard shows zero orders for every customer. The order table contains records, and the database responds normally.",
    "environment": "SQL · Orders dashboard · Query filter",
    "evidence": [
      {
        "type": "QUERY",
        "title": "orders.sql",
        "content": "SELECT id, customer_id, total\nFROM orders\nWHERE status = 'complete'\n  AND status = 'pending';",
        "detail": "A single status value cannot usually be both complete and pending."
      },
      {
        "type": "DB",
        "title": "Sample rows",
        "content": "id | customer_id | status\n41 | 1002 | complete\n42 | 1004 | pending\n43 | 1002 | complete",
        "detail": "Rows exist, but none can satisfy both status conditions at once."
      },
      {
        "type": "LOG",
        "title": "Dashboard trace",
        "content": "query_executed=true\nrows_returned=0\nsql_error=null",
        "detail": "The SQL is valid, so the issue is logical rather than a syntax error."
      }
    ],
    "hypotheses": [
      {
        "id": "h1",
        "label": "Mutually exclusive filters",
        "desc": "The query asks one row to have two different statuses."
      },
      {
        "id": "h2",
        "label": "Database is down",
        "desc": "No connection can be established."
      },
      {
        "id": "h3",
        "label": "The table is empty",
        "desc": "There are no orders to return."
      }
    ],
    "diagnosis": "The WHERE clause uses AND for two mutually exclusive status values.",
    "solution": "Use OR when either status should be included, or use IN ('complete', 'pending').",
    "lesson": "AND means every condition must be true. OR means at least one condition must be true. IN is a compact way to match one value from a list.",
    "starterCode": "SELECT id, customer_id, total\nFROM orders\nWHERE status = 'complete'\n  AND status = 'pending';",
    "fixedCode": "SELECT id, customer_id, total\nFROM orders\nWHERE status IN ('complete', 'pending');",
    "testLabels": [
      "Includes completed orders",
      "Includes pending orders",
      "Does not require two statuses at once"
    ]
  },
  {
    "id": "CCS-003",
    "title": "The Network Blackout",
    "category": "Networking",
    "difficulty": "Detective",
    "duration": "12 min",
    "xp": 160,
    "accent": "blue",
    "summary": "A service is healthy locally but unreachable from other machines.",
    "incident": "The API passes its localhost health check, but requests from a second laptop time out. DNS resolves correctly and the server process is running.",
    "environment": "HTTP · Server binding · Local network",
    "evidence": [
      {
        "type": "LOG",
        "title": "Server startup",
        "content": "API listening on 127.0.0.1:5000\nhealthcheck localhost:5000 => 200 OK",
        "detail": "127.0.0.1 is the loopback interface, reachable only from the same machine."
      },
      {
        "type": "NET",
        "title": "Remote client",
        "content": "GET http://192.168.1.24:5000/health\nError: connection timed out",
        "detail": "The remote client is trying the machine's LAN address, not its loopback address."
      },
      {
        "type": "CONFIG",
        "title": "Network checklist",
        "content": "Process running: YES\nLAN address assigned: YES\nHost binding: 127.0.0.1\nFirewall rule: pending review",
        "detail": "The binding is a strong clue, though firewall rules should also be checked."
      }
    ],
    "hypotheses": [
      {
        "id": "h1",
        "label": "Server bound only to loopback",
        "desc": "Other machines cannot connect to a loopback-only listener."
      },
      {
        "id": "h2",
        "label": "DNS is broken",
        "desc": "The host name cannot resolve."
      },
      {
        "id": "h3",
        "label": "The application crashed",
        "desc": "There is no server process listening."
      }
    ],
    "diagnosis": "The server is listening only on 127.0.0.1, so remote machines cannot reach it.",
    "solution": "For a controlled local network demo, bind to the appropriate interface (often 0.0.0.0) and verify firewall rules. Do not expose a development server to the public internet.",
    "lesson": "127.0.0.1 means “this computer.” 0.0.0.0 tells a server to listen on available IPv4 interfaces. Binding alone does not override firewalls or network policies.",
    "starterCode": "// Example server configuration\napp.listen(5000, '127.0.0.1', () => {\n  console.log('API listening');\n});",
    "fixedCode": "// For a trusted local network demo only\napp.listen(5000, '0.0.0.0', () => {\n  console.log('API listening');\n});",
    "testLabels": [
      "Local health check works",
      "Listener accepts LAN-interface traffic",
      "Firewall and network policy are checked"
    ]
  },
  {
    "id": "CCS-004",
    "title": "The Memory That Never Leaves",
    "category": "Performance",
    "difficulty": "Detective",
    "duration": "14 min",
    "xp": 180,
    "accent": "purple",
    "summary": "Memory usage climbs every time a dashboard refreshes.",
    "incident": "The dashboard starts fast, but after repeated refreshes the process consumes more memory and slows down. No single request looks unusually large.",
    "environment": "JavaScript · Event listeners · Browser lifecycle",
    "evidence": [
      {
        "type": "CODE",
        "title": "dashboard.js",
        "content": "function mountDashboard() {\n  window.addEventListener('resize', updateLayout);\n  renderDashboard();\n}",
        "detail": "Every call adds another listener. Look for a matching cleanup path."
      },
      {
        "type": "LOG",
        "title": "Refresh trace",
        "content": "mount count: 1 | resize listeners added: 1\nmount count: 8 | resize listeners added: 8\nmount count: 20 | resize listeners added: 20",
        "detail": "The listener count grows with each mount."
      },
      {
        "type": "TEST",
        "title": "Observed behaviour",
        "content": "One resize => updateLayout runs 20 times after 20 mounts.\nExpected: updateLayout runs once.",
        "detail": "Repeated callbacks can cause wasted work and retain references."
      }
    ],
    "hypotheses": [
      {
        "id": "h1",
        "label": "Listeners are never removed",
        "desc": "Repeated mounting creates duplicate handlers."
      },
      {
        "id": "h2",
        "label": "The CPU is too fast",
        "desc": "Processor speed causes memory growth."
      },
      {
        "id": "h3",
        "label": "The API returns too much JSON",
        "desc": "Response payload size explains every duplicate callback."
      }
    ],
    "diagnosis": "The component adds a resize event listener on each mount but never removes it.",
    "solution": "Return a cleanup function or remove the same handler when the dashboard unmounts.",
    "lesson": "Resources with a lifecycle—event listeners, timers, subscriptions—need cleanup. A leak can be caused by retaining references, not only by allocating huge objects.",
    "starterCode": "function mountDashboard() {\n  window.addEventListener('resize', updateLayout);\n  renderDashboard();\n}",
    "fixedCode": "function mountDashboard() {\n  window.addEventListener('resize', updateLayout);\n  renderDashboard();\n  return function cleanup() {\n    window.removeEventListener('resize', updateLayout);\n  };\n}",
    "testLabels": [
      "One active listener after mount",
      "Listener removed during cleanup",
      "Repeated mount does not multiply callbacks"
    ]
  },
  {
    "id": "CCS-005",
    "title": "The Double-Charge Incident",
    "category": "Concurrency",
    "difficulty": "Expert",
    "duration": "16 min",
    "xp": 220,
    "accent": "rose",
    "summary": "Two requests spend the same balance at almost exactly the same time.",
    "incident": "A wallet starts with 100 credits. Two purchase requests each spend 80 credits. Both succeed, leaving an impossible balance of -60.",
    "environment": "Concurrency · Shared state · Transactions",
    "evidence": [
      {
        "type": "LOG",
        "title": "Interleaved requests",
        "content": "A reads balance=100\nB reads balance=100\nA checks 100 >= 80 => true\nB checks 100 >= 80 => true\nA writes 20\nB writes 20",
        "detail": "Both requests read the same old value before either update is committed."
      },
      {
        "type": "CODE",
        "title": "wallet.js",
        "content": "if (balance >= cost) {\n  balance = balance - cost;\n  return 'purchase complete';\n}",
        "detail": "The check and update are separate operations with no atomic protection."
      },
      {
        "type": "TEST",
        "title": "Race reproduction",
        "content": "Initial balance: 100\nPurchase A: 80\nPurchase B: 80\nExpected: only one purchase succeeds\nActual: both purchases succeed",
        "detail": "This is a race condition, not a simple arithmetic error."
      }
    ],
    "hypotheses": [
      {
        "id": "h1",
        "label": "Check-and-update is not atomic",
        "desc": "Concurrent requests can both pass the balance check."
      },
      {
        "id": "h2",
        "label": "80 + 80 is less than 100",
        "desc": "The arithmetic is incorrect."
      },
      {
        "id": "h3",
        "label": "The UI uses the wrong font",
        "desc": "Visual styling affects transaction correctness."
      }
    ],
    "diagnosis": "The balance check and deduction are not atomic, allowing two concurrent purchases to use the same balance.",
    "solution": "Use a database transaction or a single conditional atomic update that only succeeds when the balance is still sufficient.",
    "lesson": "A race condition occurs when the result depends on timing. In real financial systems, enforce invariants in the database, use transactions/atomic operations, and handle failed updates safely.",
    "starterCode": "// Conceptual unsafe logic\nif (balance >= cost) {\n  balance = balance - cost;\n  return 'purchase complete';\n}",
    "fixedCode": "// Conceptual fix: perform the check and deduction atomically\nconst result = await Wallet.updateOne(\n  { userId, balance: { $gte: cost } },\n  { $inc: { balance: -cost } }\n);\nif (result.modifiedCount === 1) {\n  return 'purchase complete';\n}\nreturn 'insufficient balance';",
    "testLabels": [
      "Only one 80-credit purchase succeeds",
      "Balance never becomes negative",
      "Database update is atomic"
    ]
  },
  {
    "id": "CCS-006",
    "title": "The Broken Launch",
    "category": "Deployment",
    "difficulty": "Detective",
    "duration": "11 min",
    "xp": 170,
    "accent": "green",
    "summary": "The app works on the developer's laptop but crashes after deployment.",
    "incident": "The deployment succeeds, but the production process exits immediately. The logs mention a missing configuration value. The developer's machine has a local .env file.",
    "environment": "Node.js · Environment variables · Deployment",
    "evidence": [
      {
        "type": "LOG",
        "title": "Production logs",
        "content": "Starting server...\nError: Missing required environment variable API_BASE_URL\nProcess exited with code 1",
        "detail": "The deployed runtime cannot read a variable that exists only in the developer's local environment."
      },
      {
        "type": "CONFIG",
        "title": "Repository snapshot",
        "content": ".env exists on developer laptop: YES\n.env committed to Git: NO\nProduction variable configured: NO",
        "detail": "Keeping .env out of Git is correct; production variables must be configured in the hosting provider."
      },
      {
        "type": "TEST",
        "title": "Environment comparison",
        "content": "Local: API_BASE_URL=http://localhost:5000\nProduction: API_BASE_URL=(undefined)",
        "detail": "Local and production environments do not share environment variables automatically."
      }
    ],
    "hypotheses": [
      {
        "id": "h1",
        "label": "Production variable is missing",
        "desc": "The hosting runtime was never configured with API_BASE_URL."
      },
      {
        "id": "h2",
        "label": "Git ignore is broken",
        "desc": "Every ignored file must be committed."
      },
      {
        "id": "h3",
        "label": "The CSS bundle is too large",
        "desc": "Styling causes the Node process to exit before startup."
      }
    ],
    "diagnosis": "The required API_BASE_URL variable is missing from the production environment.",
    "solution": "Add the variable in the hosting provider's environment settings and redeploy. Keep secrets out of Git; commit a safe .env.example instead.",
    "lesson": "Environment variables are configured per runtime. A local .env file is not automatically deployed. Never commit credentials or secret tokens.",
    "starterCode": "const apiBaseUrl = process.env.API_BASE_URL;\nif (!apiBaseUrl) {\n  throw new Error('Missing required environment variable API_BASE_URL');\n}",
    "fixedCode": "// Configure API_BASE_URL in the hosting provider's environment settings.\nconst apiBaseUrl = process.env.API_BASE_URL;\nif (!apiBaseUrl) {\n  throw new Error('Missing required environment variable API_BASE_URL');\n}",
    "testLabels": [
      "Variable exists in production settings",
      "Local .env stays out of Git",
      "Application starts after redeploy"
    ]
  }
];
