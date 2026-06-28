import 'dotenv/config';
import cors from "cors";
import express from "express";
import { GoogleGenAI } from '@google/genai';

const app=express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
    console.log("Received request at /");
    res.send("Server working.");
});

const port= process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});


app.post("/generate", async (req, res) => {
try{
    const formData=req.body;
    const prompt =`
Lead Name: ${formData.name}
Interest: ${formData.interest}
Lead Message: ${formData.message}

You are an experienced real estate broker working for a premium Dubai real estate brokerage.

You will receive details of an incoming lead.

Your tasks are:

1. Write a warm, professional first-response message that the broker can send to the lead.
2. Evaluate the quality of the lead and assign a score from 1 to 10.
3. Briefly explain why the lead received that score.

Respond with ONLY a valid text. Do not include markdown, code fences, or anything outside the valid text.

Use exactly this structure:

{
"reply": "<broker's response>",
"score": <integer 1-10>,
"reasoning": "<brief explanation>"
}

Requirements for "reply":

* Write as if a real human broker is personally responding.
* The tone should be warm, confident, conversational, and professional.
* Avoid sounding robotic, scripted, or overly enthusiastic.
* Do NOT use generic AI phrases such as:

  * "I hope this message finds you well"
  * "Thank you for reaching out"
  * "We are delighted"
  * "Feel free to contact us anytime"
* Acknowledge the lead's specific request naturally.
* Mention the property type, location, budget, or requirements if provided.
* Ask 1-2 relevant follow-up questions only if important information is missing.
* Keep the message concise (3-5 sentences).
* Do not be pushy or salesy.
* Do not invent information that the lead did not provide.

Lead scoring criteria (1-10):

Score 9-10:

* Strong buying intent
* Clear budget
* Specific property/area mentioned
* Urgency or timeline provided
* Contact details provided
* Ready-to-buy or ready-to-view language

Score 7-8:

* Genuine interest with some specifics, but missing a few details

Score 4-6:

* Moderate interest but vague requirements
* Mostly exploratory enquiries

Score 1-3:

* Very vague enquiry
* Browsing-only intent
* No meaningful details or signs of commitment

Requirements for "reasoning":

* Explain in 1-2 concise sentences why the lead received the score.
* Mention both positive signals and missing information where applicable.
* Example:
  "The lead provided a clear budget and specified Dubai Marina, indicating genuine interest. However, no purchase timeline or contact details were provided."

Return ONLY valid text.

`;
    const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    config: {
        responseMimeType: "application/json"
    },
    contents: prompt
})

    const text = response.text;
    console.log("Response from AI:", text);
    
    const result = JSON.parse(text);

    res.send(JSON.stringify(result));
    
}
catch (error) {

        console.error(error);

        res.status(500).json({
            error:"Something went wrong while generating the response."
        });
}
});


