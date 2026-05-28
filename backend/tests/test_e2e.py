import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.supabase_client import get_supabase_client
from app.services.agent_service import AgentService
from app.services.document_service import DocumentService
from app.services.conversation_service import ConversationService
from app.services.rag_service import RagService
from app.core.dependencies import get_embedding_service_dep
from fastapi import Request

# Create a mock request object to get the embedding service
class MockApp:
    class MockState:
        pass
    def __init__(self):
        from app.services.embedding_service import EmbeddingService
        self.state = self.MockState()
        print("Loading embedding model (this may take a few seconds)...")
        self.state.embedding_service = EmbeddingService()
        self.state.embedding_service.load_model()

class MockRequest:
    def __init__(self):
        self.app = MockApp()
        self.client = type("MockClient", (), {"host": "127.0.0.1"})()

async def run_e2e_test():
    print("========================================")
    print("  SYNAPSE BACKEND — EXTENDED E2E TEST   ")
    print("========================================\n")
    
    # 1. Initialization
    print("[1/5] Initializing services...")
    supabase = get_supabase_client()
    request = MockRequest()
    embedding_service = request.app.state.embedding_service
    
    agent_svc = AgentService(supabase)
    doc_svc = DocumentService(supabase, embedding_service)
    conv_svc = ConversationService(supabase)
    rag_svc = RagService(supabase, embedding_service)
    
    dummy_user_id = "11111111-2222-3333-4444-555555555555"
    agent_id = None
    
    try:
        # 2. Create Agent
        print("\n[2/5] Creating AI Agent...")
        from app.schemas.agent import AgentCreate
        agent = agent_svc.create_agent(dummy_user_id, AgentCreate(
            name="Acme Corp Support",
            description="Support agent for Acme Corp",
            welcome_message="Hello from Acme Corp!"
        ))
        agent_id = agent.id
        print(f"SUCCESS: Agent created (ID: {agent_id})")
        
        # 3. Add Knowledge (Document)
        print("\n[3/5] Adding knowledge (Text Paste)...")
        text_content = """Acme Corp is a leading provider of giant rubber bands and portable holes. 
Our portable holes cost $49.99 each and come with a lifetime warranty against accidental falling.
Giant rubber bands are sold in packs of 10 for $15.99.
Our return policy allows returns within 30 days of purchase, provided the portable hole hasn't been used to store angry badgers.
For business inquiries, contact wholesale@acmecorp.com."""
        
        doc = await doc_svc.add_text_paste(
            user_id=dummy_user_id,
            agent_id=agent_id,
            title="Acme Corp FAQ",
            content=text_content
        )
        print(f"SUCCESS: Document added. Status: {doc.status}")
        
        # Wait a moment for background processing to finish
        print("      Waiting for background processing (chunking & embedding)...")
        for _ in range(10):
            await asyncio.sleep(1)
            updated_doc = doc_svc.get_document(dummy_user_id, doc.id)
            if updated_doc.status == "ready":
                print(f"SUCCESS: Document processed successfully! Generated {updated_doc.chunk_count} chunks.")
                break
            elif updated_doc.status == "failed":
                raise Exception(f"Document processing failed: {updated_doc.error_message}")
        else:
            raise Exception("Document processing timed out.")
            
        # 4. Test RAG / Chat
        print("\n[4/5] Testing RAG Pipeline (Chat)...")
        session_id = "test-session-123"
        user_message = "How much do portable holes cost and what is the return policy?"
        print(f"      User: {user_message}")
        
        print("      AI: ", end="", flush=True)
        # Consume the async generator from RAG service
        full_response = ""
        sources = []
        
        async for sse_event in rag_svc.chat_stream(
            agent_id=agent_id,
            agent_name="Acme Support",
            fallback_message="I'm sorry, I don't know.",
            session_id=session_id,
            user_message=user_message,
        ):
            # Parse the SSE event
            import json
            lines = sse_event.strip().split("\n")
            event_type = None
            data = None
            for line in lines:
                if line.startswith("event: "):
                    event_type = line[7:]
                elif line.startswith("data: "):
                    data_str = line[6:]
                    if data_str:
                        data = json.loads(data_str)
            
            if event_type == "token" and data:
                token = data.get("token", "")
                full_response += token
                print(token, end="", flush=True)
            elif event_type == "sources" and data:
                sources = data.get("sources", [])
            elif event_type == "error":
                print(f"\nERROR in chat stream: {data}")
                
        print("\n\nSUCCESS: Chat completed.")
        if sources:
            print("      Sources cited:")
            for s in sources:
                print(f"      - {s['document_name']} (Relevance: {s['similarity_score']})")
        else:
            print("      WARNING: No sources cited (RAG failed to retrieve context)")
            
    except Exception as e:
        print(f"\nERROR: TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # 5. Cleanup
        if agent_id:
            print(f"\n[5/5] Cleaning up (deleting agent {agent_id})...")
            try:
                agent_svc.delete_agent(dummy_user_id, agent_id)
                print("SUCCESS: Cleanup successful. All test data removed.")
            except Exception as e:
                print(f"ERROR: Cleanup failed: {e}")
                
    print("\n========================================")
    print("            TEST RUN COMPLETE           ")
    print("========================================")

if __name__ == "__main__":
    asyncio.run(run_e2e_test())
