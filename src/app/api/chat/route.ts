import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides answers with relevant source citations when available.",
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
    });

    // Extract sources from the response (you'll need to implement your own logic here)
    const sources = messages
      .filter((msg: any) => msg.sources)
      .flatMap((msg: any) => msg.sources);

    return NextResponse.json({
      content: completion.choices[0].message.content,
      sources: sources,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
