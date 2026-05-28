import asyncio
import os
import sys

# Add backend to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.supabase_client import get_supabase_client
from app.services.agent_service import AgentService
from app.schemas.agent import AgentCreate
from app.core.exceptions import NotFoundError, ForbiddenError

async def test_db():
    print("Testing Supabase connection...")
    try:
        supabase = get_supabase_client()
        
        # Test 1: Try to query agents table
        print("Checking if 'agents' table exists and is accessible...")
        response = supabase.table("agents").select("id", count="exact").limit(1).execute()
        print(f"Table 'agents' accessible. Count: {response.count}")
        
        # If we got here, DB is accessible. Let's try to create a dummy agent.
        print("\nTesting Agent Creation...")
        service = AgentService(supabase)
        
        # We need a user ID for the agent, normally comes from JWT.
        # We'll use a dummy UUID.
        dummy_user_id = "00000000-0000-0000-0000-000000000000"
        
        agent_data = AgentCreate(
            name="Test Verification Agent",
            description="Created by E2E test script",
            welcome_message="Hello from test agent!",
        )
        
        try:
            agent = service.create_agent(dummy_user_id, agent_data)
            print(f"SUCCESS! Agent created with ID: {agent.id}")
            
            # Clean up
            print(f"Cleaning up: deleting test agent...")
            service.delete_agent(dummy_user_id, agent.id)
            print("Cleanup successful.")
            
        except Exception as e:
            print(f"FAILED to create agent. Error: {e}")
            if "permission denied" in str(e).lower() or "rls" in str(e).lower() or "401" in str(e) or "403" in str(e):
                print("\n>>> IMPORTANT: Your SUPABASE_SERVICE_ROLE_KEY appears to be an anon key instead of a service role key. The backend needs the service_role key to bypass RLS policies.")
                
    except Exception as e:
        print(f"\nERROR: Failed to connect to Supabase or run query: {e}")
        if "relation \"public.agents\" does not exist" in str(e):
            print("\n>>> IMPORTANT: The database tables do not exist. Did you run the SQL migrations (001-008) in the Supabase SQL Editor?")

if __name__ == "__main__":
    asyncio.run(test_db())
