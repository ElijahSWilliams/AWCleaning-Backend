import Groq from "groq-sdk";
import dotenv from "dotenv"; //load environment variables from .env file
import cors from "cors"; //install cirs using npm install cors
import express from "express"; //install express using npm install express
const port = 3000; //set the port number
const app = express(); //initialize express
dotenv.config(); //set up env file config  

/* List of Services */
const services = [
  { name: "Residential Cleaning", price: 80 },
  { name: "Commercial Cleaning", price: 300 },
  { name: "Deep Cleaning", price: 150 },
  { name: "Move-in/out Cleaning", price: 200 },
  { name: "Airbnb Cleaning", price: 100 },
  { name: "Eco-friendly Cleaning", price: 100 },
]; 

const serviceText = services.map((s) => `- ${s.name}: $${s.price}`).join("\n");



//instantiate the AI client
const ai = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});  

//middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json()); //parse JSON bodies

//routes 
//test route
app.get("/", (req, res) => {
  res.send("Hello World!", ); //send a response to the client  
});

//Chat API route
app.post("/chat", async (req, res) => {  

  /* Grab user Message */  
  const {message} = req.body;  
  console.log(message); 
 

  if (!message) {
    return res.status(400).json({ reply: "Message is required." });
  }

  try {  
    const chatCompletion = await ai.chat.completions.create({ 
      model: "openai/gpt-oss-20b", //set model 
      messages: [  
        {
          role: "system", 
          content: `You are a helpful cleaning assistant. Suggest services to the user based on their cleaning needs. 
          Only use these Services: 
          ${serviceText} 

          Rules:  
          - Introduce yourself as "Sudds, the Helpful Cleaning Assistant" and let the user know that you can suggest services for them as soon as the page loads.
          - Do not invent new services. 
          - Only recommend services from the list. 
          - Keep responses short and clear. 
          - Ask the user if there is anything else that you can help them with once they tell you what service they need.
          ` 
        }, 
        {
          role: "user",
          content: message,
        },
      ]
    }); 

    const reply =
      chatCompletion.choices[0]?.message?.content || "No response"; //chatCompleteion? first choice? is there a message? show content
      res.json({ reply });
  } catch (error) {
    console.error("Groq Error:", error);

    res.status(500).json({
      reply: "Error talking to AI. Please try again.",
    });
  }
}); 


//start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`); //log a message when the server starts
});

