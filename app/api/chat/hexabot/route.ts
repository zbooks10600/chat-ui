import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.hexabot_api_key, "Hexabot")

    const baseURL = "http://localhost:4000"

    const payload = {
      settings: chatSettings,
      messages
    }

    const response = await fetch(`${baseURL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${profile.hexabot_api_key || ""}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Error from local chatbot API: ${response.statusText}`)
    }

    const responseData = await response.json()

    return responseData
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Hexabot API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Hexabot API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
