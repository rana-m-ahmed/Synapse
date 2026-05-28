import time
import json
import logging
import asyncio

from fastapi.testclient import TestClient
from app.main import app
from app.core.dependencies import get_current_user

# Disable verbose logging from external libs
logging.getLogger("httpx").setLevel(logging.WARNING)

# Override auth dependency to simulate a logged-in user
DUMMY_USER_ID = "11111111-2222-3333-4444-555555555555"

async def mock_get_current_user():
    return {"user_id": DUMMY_USER_ID, "email": "test@example.com"}

app.dependency_overrides[get_current_user] = mock_get_current_user

def run_tests():
    print("========================================")
    print("    SYNAPSE BACKEND - API ROUTE TESTS   ")
    print("========================================\n")
    
    # We use 'with TestClient(app)' so that the lifespan (startup/shutdown) runs.
    # This properly initializes the embedding model!
    print("Starting TestClient (will load embedding model)...")
    with TestClient(app) as client:
        print("TestClient started successfully.\n")
        
        # 1. Create Agent
        print("[1/5] Testing POST /api/v1/agents/")
        agent_data = {
            "name": "Acme API Support",
            "description": "API Test Agent",
            "welcome_message": "Hello from API tests!",
            "accent_color": "#123456",
            "fallback_message": "I do not know."
        }
        res = client.post("/api/v1/agents/", json=agent_data)
        assert res.status_code == 201, f"Failed to create agent: {res.text}"
        agent_id = res.json()["id"]
        print(f"SUCCESS: Agent created (ID: {agent_id})")
        
        try:
            # 2. Add Document
            print("\n[2/5] Testing POST /api/v1/documents/text")
            doc_data = {
                "agent_id": agent_id,
                "title": "API Return Policy",
                "content": "Acme Corp allows returns within 30 days of purchase for full refunds. We sell API keys for $99.99 each. Please contact api@acmecorp.com for volume pricing."
            }
            res = client.post("/api/v1/documents/text", json=doc_data)
            assert res.status_code == 201, f"Failed to add document: {res.text}"
            doc_id = res.json()["id"]
            print(f"SUCCESS: Document added (ID: {doc_id})")
            
            # 3. Poll Document Status
            print("\n[3/5] Waiting for document background processing...")
            max_retries = 15
            for i in range(max_retries):
                time.sleep(1)
                res = client.get(f"/api/v1/documents/{doc_id}")
                status = res.json()["status"]
                if status == "ready":
                    chunks = res.json()["chunk_count"]
                    print(f"SUCCESS: Document processed. Status: ready. Chunks generated: {chunks}")
                    break
                elif status == "failed":
                    error = res.json().get("error_message")
                    raise Exception(f"Document processing failed: {error}")
            else:
                raise Exception("Document processing timed out.")
                
            # 4. Chat endpoint (RAG)
            print("\n[4/5] Testing POST /api/v1/chat/ (Streaming RAG)...")
            chat_data = {
                "agent_id": agent_id,
                "session_id": "test-api-session-001",
                "message": "What is the return policy and how much are API keys?"
            }
            print(f"      User: {chat_data['message']}")
            print("      AI: ", end="", flush=True)
            
            res = client.post("/api/v1/chat/", json=chat_data)
            assert res.status_code == 200, f"Chat request failed: {res.text}"
            
            # Read SSE stream
            sources = []
            for line in res.iter_lines():
                if line.startswith("event: "):
                    event_type = line[7:]
                elif line.startswith("data: "):
                    data_str = line[6:]
                    if data_str:
                        data = json.loads(data_str)
                        if event_type == "token":
                            print(data.get("token", ""), end="", flush=True)
                        elif event_type == "sources":
                            sources = data.get("sources", [])
                            
            print("\n\nSUCCESS: Chat stream completed.")
            if sources:
                print("      Sources cited:")
                for s in sources:
                    print(f"      - {s['document_name']} (Relevance: {s['similarity_score']})")
            else:
                print("      WARNING: No sources cited")
                
        except Exception as e:
            print(f"\nERROR: TEST FAILED: {e}")
            
        finally:
            # 5. Cleanup
            print(f"\n[5/5] Cleaning up Agent {agent_id}...")
            res = client.delete(f"/api/v1/agents/{agent_id}")
            if res.status_code == 200:
                print("SUCCESS: Cleanup complete.")
            else:
                print(f"ERROR: Cleanup failed: {res.text}")

if __name__ == "__main__":
    run_tests()
