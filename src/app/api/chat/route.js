import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { hiteshPersona } from '../../lib/hiteshPersona'
import { piyushPersona } from '../../lib/piyushPersona'


const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
})

const personaConfigs = {
  "Hitesh Choudhary": hiteshPersona,
  "Piyush Garg": piyushPersona,
}

export async function POST(req) {
  try {
    // Destructure the message and persona from the request body.
    const { message, persona } = await req.json()

    if (!message || !persona) {
      return NextResponse.json(
        { error: 'Message and persona are required' },
        { status: 400 }
      )
    }

    //  config using the persona name object.
    const config = personaConfigs[persona]
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid persona' },
        { status: 400 }
      )
    }

    // 1. Start with the system instrction
    // 2. Add the training examples
    // 3. End with the user current mesage
    const messages = [
      {
        role: "system",
        content: config.system_instruction
      },
      ...config.training_examples.flatMap(example => [
        { role: "user", content: example.user_input },
        { role: "assistant", content: example.expected_response }
      ]),
      {
        role: "user",
        content: message
      }
    ];

    // OpenAI API call 
    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: messages,
      max_tokens: 250,
      temperature: 0.7,
    })

    //  AI response 
    const response = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response."

    // Return AI response.
    return NextResponse.json({ response })

  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    )
  }
}