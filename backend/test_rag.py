import asyncio
import os
import uuid
from supabase import create_client
from app.core.config import get_settings
from app.services.embedding_service import EmbeddingService
from app.services.rag_service import RagService

async def run_tests():
    settings = get_settings()
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    
    embedding_service = EmbeddingService()
    embedding_service.load_model()
    
    rag_service = RagService(supabase, embedding_service)
    
    # We will use the specific test agent
    agent_id = "2c3d5949-f19d-4252-8830-4dabc6c20a31"
    
    # Run a continuous conversation to test history and reformulation
    session_id = str(uuid.uuid4())
    print(f"Starting test session: {session_id}")
    
    test_prompts = [
        "Hi there!", 
        "What is the CA project?", 
        "Who made it?", 
        "What is the capital of France?", 
        "Thanks for the info!"
    ]
    
    for prompt in test_prompts:
        print(f"\n======================================")
        print(f"User: {prompt}")
        print(f"======================================")
        
        full_response = ""
        sources = []
        
        async for chunk in rag_service.chat_stream(
            agent_id=agent_id,
            agent_name="Synapse Test Agent",
            fallback_message="I don't have information on that.",
            session_id=session_id,
            user_message=prompt
        ):
            # Parse the SSE output
            lines = chunk.strip().split("\n")
            event_type = None
            for line in lines:
                if line.startswith("event: "):
                    event_type = line[7:]
                elif line.startswith("data: ") and event_type:
                    import json
                    data_str = line[6:]
                    if not data_str:
                        continue
                    data = json.loads(data_str)
                    
                    if event_type == "token" and "token" in data:
                        token = data["token"]
                        full_response += token
                        print(token, end="", flush=True)
                    elif event_type == "sources":
                        sources = data.get("sources", [])
        
        print("\n\n[Sources Found]:", len(sources))

if __name__ == "__main__":
    asyncio.run(run_tests())
