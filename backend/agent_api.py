from fastapi import FastAPI
from pydantic import BaseModel
from langgraph.prebuilt import create_react_agent
from langchain.tools import tool
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable
import langchain
import requests

import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

os.environ["GOOGLE_API_KEY"]=os.getenv("GOOGLE_API_KEY")

messages_input = [
    HumanMessage(content="How much money has been collected by Jeet?")
]

app = FastAPI()

class Query(BaseModel):
    message: str

@tool
def fetch_donar() -> str:
    """Fetches and returns all donor records. In the response, 'amount' is the donated amount and 'adminName' is who collected it."""

    url = "https://pather-sathi-1.onrender.com/donors/records"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            # Minimize token consumption to stay within free-tier rate limits
            donors = data.get("donors", [])
            simplified = [
                {
                    "name": d.get("name"),
                    "amount": d.get("amount"),
                    "adminName": d.get("adminName"),
                    "year": d.get("year")
                }
                for d in donors
            ]
            import json
            return json.dumps(simplified)
        return f"Failed to fetch data. Status code: {response.status_code}"
    except requests.exceptions.RequestException as e:
        return f"Error connecting to server: {e}"

system_instructions = """
You are a specialized assistant exclusively designed to help with donor details.
If the user asks a question NOT related to donors, reply EXACTLY with:
"I am a specialized assistant for donor details. This is not the correct place for your question."
"""

# Configure Models with High Free-Tier Daily Quotas:
# - gemini-1.5-flash: 1,500 requests/day, 15 RPM
# - gemini-3.5-flash-lite: 500 requests/day, 15 RPM
primary_llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash", 
    temperature=0,
    max_retries=1,
)

fallback_1 = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite", 
    temperature=0,
    max_retries=1,
)

# Chain models with automatic failover
llm_with_fallbacks = primary_llm.with_fallbacks([fallback_1])

# Initialize the agent ONCE at startup (avoids recompiling graph on every request)
agents = create_react_agent(
    model=llm_with_fallbacks,
    tools=[fetch_donar],
    prompt=system_instructions
)

@app.post("/ask-agent")
def ask_agent(query: Query):
    try:
        print("AI agent ready to invoke")
        response = agents.invoke({"messages": [HumanMessage(content=query.message)]})
        message = response["messages"][-1]
        content = message.content
        if isinstance(content, str):
            return {"answer": [{"type": "text", "text": content}]}
        elif isinstance(content, list):
            return {"answer": content}
        return {"answer": [{"type": "text", "text": str(content)}]}
    except Exception as e:
        print(f"All models in fallback cascade failed or rate-limited: {e}")
        return {
            "answer": [{
                "type": "text", 
                "text": "All AI models are currently experiencing high traffic. Please try again later."
            }]
        }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-agent"}