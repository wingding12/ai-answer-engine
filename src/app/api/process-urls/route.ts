import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { urls } = await req.json();

    // Here you would implement the logic to:
    // 1. Fetch content from URLs
    // 2. Process the content through an LLM
    // 3. Return a summary

    const urlContents = await Promise.all(
      urls.map(async (url: string) => {
        const response = await fetch(url);
        const text = await response.text();
        return text;
      })
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes content from multiple URLs.",
        },
        {
          role: "user",
          content: `Please summarize the following content from different URLs: ${urlContents.join("\n\n")}`,
        },
      ],
    });

    return NextResponse.json({
      summary: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error processing URLs:", error);
    return NextResponse.json(
      { error: "Failed to process URLs" },
      { status: 500 }
    );
  }
}
