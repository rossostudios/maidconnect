# Supabase Edge Functions

Edge Functions are server-side TypeScript functions that run on Supabase's global edge network, close to your users.

## Directory Structure

```
supabase/functions/
├── README.md                 # This file
├── _shared/                  # Shared utilities (optional)
│   └── cors.ts              # CORS helper
├── example-function/         # Example function
│   └── index.ts             # Function entry point
└── [function-name]/          # Your functions
    └── index.ts
```

## Creating a New Function

### Using Supabase CLI

```bash
# Create a new function
supabase functions new my-function

# This creates:
# supabase/functions/my-function/index.ts
```

### Manually

Create a directory with an `index.ts` file:

```typescript
// supabase/functions/my-function/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  const data = {
    message: "Hello from Supabase Edge Functions!"
  };

  return new Response(
    JSON.stringify(data),
    {
      headers: {
        "Content-Type": "application/json",
        "Connection": "keep-alive"
      }
    }
  );
});
```

## Testing Functions Locally

```bash
# Serve all functions
supabase functions serve

# Serve a specific function
supabase functions serve my-function

# Test with curl
curl --location --request POST 'http://localhost:54321/functions/v1/my-function' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'
```

## Deploying Functions

### Deploy All Functions

```bash
supabase functions deploy
```

### Deploy Specific Function

```bash
supabase functions deploy my-function
```

### Deploy with Environment Variables

```bash
supabase secrets set MY_SECRET=value
supabase functions deploy my-function
```

## Common Use Cases

### 1. Webhook Handlers

Handle webhooks from third-party services (Stripe, Sanity, etc.):

```typescript
// supabase/functions/webhook-stripe/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "stripe";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16"
});

Deno.serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    // Handle event
    switch (event.type) {
      case "payment_intent.succeeded":
        // Handle payment success
        break;
      // ... other events
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

### 2. Scheduled Jobs (Cron)

Run periodic tasks:

```typescript
// supabase/functions/cleanup-old-data/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Delete records older than 30 days
  const { data, error } = await supabase
    .from("logs")
    .delete()
    .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }

  return new Response(JSON.stringify({ deleted: data?.length || 0 }), {
    status: 200
  });
});
```

### 3. API Endpoints

Create custom API endpoints:

```typescript
// supabase/functions/api-geocode/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  const { address } = await req.json();

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${Deno.env.get("GOOGLE_MAPS_API_KEY")}`
  );

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
```

### 4. Database Triggers

Respond to database events:

```typescript
// supabase/functions/on-user-created/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const { record } = await req.json();

  // Send welcome email
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "welcome@casaora.com",
      to: record.email,
      subject: "Welcome to Casaora!",
      html: "<p>Thank you for signing up!</p>"
    })
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200
  });
});
```

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```typescript
try {
  // Your logic
} catch (error) {
  console.error("Function error:", error);
  return new Response(
    JSON.stringify({ error: error.message }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }
  );
}
```

### 2. CORS Headers

For browser requests, include CORS headers:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle OPTIONS request
if (req.method === "OPTIONS") {
  return new Response(null, { headers: corsHeaders });
}

// Include in response
return new Response(data, {
  headers: { ...corsHeaders, "Content-Type": "application/json" }
});
```

### 3. Environment Variables

Use environment variables for secrets:

```typescript
const apiKey = Deno.env.get("API_KEY");
if (!apiKey) {
  return new Response("Missing API_KEY", { status: 500 });
}
```

Set secrets:
```bash
supabase secrets set API_KEY=your_key
```

### 4. Authentication

Verify JWT tokens from Supabase Auth:

```typescript
import { createClient } from "jsr:@supabase/supabase-js@2";

const authHeader = req.headers.get("Authorization");
if (!authHeader) {
  return new Response("Unauthorized", { status: 401 });
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
  { global: { headers: { Authorization: authHeader } } }
);

const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return new Response("Unauthorized", { status: 401 });
}
```

## Monitoring & Logs

### View Logs

```bash
# View logs for a function
supabase functions logs my-function

# Follow logs in real-time
supabase functions logs my-function --follow
```

### Via Dashboard

Visit your Supabase Dashboard > Edge Functions > [Function Name] > Logs

## Debugging

### Local Development

```bash
# Enable debug mode
supabase functions serve my-function --debug

# Use console.log in your function
console.log("Debug info:", data);
```

### Production Issues

1. Check logs in Dashboard
2. Use Claude Code MCP tools:
   ```
   Ask Claude: "Get Supabase logs for edge-function service"
   ```

## Deployment with Claude Code

Claude Code can deploy Edge Functions using MCP tools:

```
Ask Claude: "Deploy the webhook-stripe edge function to Supabase"
```

Available MCP tools:
- `list_edge_functions` - List all functions
- `get_edge_function` - Get function code
- `deploy_edge_function` - Deploy a function

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy Docs](https://deno.com/deploy/docs)
- [Edge Runtime API](https://supabase.com/docs/guides/functions/deploy)

---

**Need Help?**

- Check the example function in `supabase/functions/example-function/`
- Ask Claude Code for help with Edge Functions
- Ask the platform team (or Claude via MCP) for the latest Supabase MCP instructions if you need help.
