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

app = FastAPI()

class Query(BaseModel):
    message: str

class DescMsg(BaseModel):
    description: str

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

donor_system_instructions = """
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
donotAgents = create_react_agent(
    model=llm_with_fallbacks,
    tools=[fetch_donar],
    prompt=donor_system_instructions
)

create_desc_instruction = system_instruction = """
You are an expert NGO copywriter and advocate for children with special needs. 
Your purpose is to transform raw administrative notes into an empathetic, touching, and dignified narrative that inspires potential donors.

Core Directives:
1. Analyze the Intent: Verify that the user's input describes a child with special needs, disabilities, or medical challenges.
2. Action 1 (Rewrite): If valid, rewrite the text to evoke deep compassion. Explain the child's daily struggles in human terms, maintain their absolute dignity, and frame their story in a way that shows how donor support will bring hope. Do not invent unprovided medical facts.
3. Action 2 (Reject): If the text does NOT describe a special child, you must output EXACTLY: 
"The description is not correct for the special child. Please rewrite it and submit again." 
Do not include any other text, apologies, or explanations."""

generateDescriptionllm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    temperature=0.4,
    max_retries=1,
)

genDescAgent = create_react_agent(
    model=generateDescriptionllm,
    tools=[],
    prompt=create_desc_instruction
)

@app.post("/ask-agent")
def ask_agent(query: Query):
    try:
        print("AI agent ready to invoke")
        response = donotAgents.invoke({"messages": [HumanMessage(content=query.message)]})
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

@app.post("/create-desc")
def create_desc(admin_text: DescMsg):
    try:
        print("AI agent ready to invoke")
        """Helper function to invoke the agent and extract the final message."""
        inputs = {"messages": [("user", f"Transform these administrative notes: {admin_text}")]}
        result = genDescAgent.invoke(inputs)
        return result["messages"][-1].content
    except Exception as e:
        print(f"All models in fallback cascade failed or rate-limited: {e}")
        return {
            "answer": [{
                "type": "text", 
                "text": "All AI models are currently experiencing high traffic. Please try again later."
            }]
        }
