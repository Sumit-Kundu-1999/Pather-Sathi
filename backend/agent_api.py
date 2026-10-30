from fastapi import FastAPI
from pydantic import BaseModel
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage
import langchain
import requests

import os
from dotenv import load_dotenv

load_dotenv()

os.environ["GOOGLE_API_KEY"]=os.getenv("GOOGLE_API_KEY")

messages_input = [
    HumanMessage(content="How much money has been collected by Jeet?")
]

app = FastAPI()

class Query(BaseModel):
    message: str

def fetch_donar() -> str:
    """Fetches and returns all donor records. In the response, 'amount' is the donated amount and 'adminName' is who collected it."""

    url = "https://pather-sathi-1.onrender.com/donors/records"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.text
        return f"Failed to fetch data. Status code: {response.status_code}"
    except requests.exceptions.RequestException as e:
        return f"Error connecting to server: {e}"

system_instructions = """
You are a specialized assistant exclusively designed to help with donor details.
If the user asks a question NOT related to donors, reply EXACTLY with:
"I am a specialized assistant for donor details. This is not the correct place for your question."
"""

model = init_chat_model(
    model="google_genai:gemini-3.5-flash",
    max_retries=2,  # Stop after 2 retries if quota/rate limit is hit
)

agents = create_agent(
    model=model,
    tools=[fetch_donar],
    system_prompt=system_instructions,
)

@app.post("/ask-agent")
async def ask_agent(query: Query):
        print("AI agent ready to invoke");
        response = agents.invoke({"messages": [HumanMessage(content=query.message)]})
        message = response["messages"][-1]
        return {"answer": message.content}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-agent"}