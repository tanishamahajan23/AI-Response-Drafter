import 'dotenv/config';
import express from "express";
import { GoogleGenAI } from '@google/genai';

const app=express();
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

console.log(process.env.GEMINI_API_KEY);

const port= process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

app.use(express.json());
app.post("/generate", async (req, res) => {
try{
    const formData=req.body;
    const prompt = `
Lead Name: ${formData.name}
Interest: ${formData.interest}
Lead Message: ${formData.message}

You are an assistant for a Dubai real estate brokerage. Given an incoming
lead, you write a warm, professional first-response message and score the
lead's quality.
Respond with ONLY a valid JSON object, no markdown, no preamble. Use exactly
this shape:
{
  "reply": "<the draft message the agent can send, 3-5 sentences>",
  "score": <integer 1-10>,
  "reasoning": "<one or two sentences explaining the score>"
}

Scoring guidance:- Higher scores for: clear budget, urgency, specific property/area,
  contact details, ready-to-buy language.- Lower scores for: vague messages, no specifics, browsing-only language.

Reply should be friendly, professional and not pushy and reference what the lead asked about.
`;
    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
})

    const text = response.text;
    console.log("Response from AI:", text);
    const result = JSON.parse(text);

    res.json(result);
}
catch (error) {

        console.error(error);

        res.status(500).json({
            error:"Something went wrong while generating the response."
        });
}
});
app.get("/", (req, res) => {
    res.send("Server working.");
});

