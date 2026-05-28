import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from app.core.config import get_settings

async def test_groq():
    print("Testing Groq LLM API...")
    try:
        settings = get_settings()
        llm = ChatGroq(
            model=settings.GROQ_MODEL_NAME,
            api_key=settings.GROQ_API_KEY,
            temperature=0,
            max_tokens=10
        )
        
        response = await llm.ainvoke([HumanMessage(content="Hello")])
        print(f"SUCCESS: Groq responded with: '{response.content}'")
    except Exception as e:
        print(f"FAILED to connect to Groq. Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_groq())
