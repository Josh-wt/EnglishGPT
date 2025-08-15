import requests
import sys
import json
import base64
from datetime import datetime
import os
import uuid

class EnglishMarkingAPITester:
    def __init__(self, base_url="https://fbebd692-a762-4932-acf2-3bd29b440733.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_id = None
        self.test_user_data = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'} if not files else {}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)[:500]}...")
                    return True, response_data
                except:
                    print(f"Response: {response.text[:200]}...")
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    # NEW USER MANAGEMENT TESTS
    def test_create_user(self):
        """Test creating a new user with 3 free credits"""
        user_data = {
            "user_id": f"test_user_{uuid.uuid4().hex[:8]}",
            "email": "john.smith@example.com",
            "name": "John Smith"
        }
        
        success, response = self.run_test("Create New User", "POST", "users", 200, data=user_data)
        if success and 'user' in response:
            user = response['user']
            self.test_user_id = user['user_id']
            self.test_user_data = user
            print(f"✅ User created with ID: {user['user_id']}")
            print(f"✅ Initial credits: {user['credits']}")
            print(f"✅ Questions marked: {user['questions_marked']}")
            
            # Verify user has 3 free credits
            if user['credits'] == 3:
                print("✅ User correctly initialized with 3 free credits")
            else:
                print(f"❌ Expected 3 credits, got {user['credits']}")
                
            return True, user
        return False, {}

    def test_get_user(self):
        """Test retrieving user information"""
        if not self.test_user_id:
            print("❌ No test user ID available")
            return False, {}
            
        success, response = self.run_test("Get User Info", "GET", f"users/{self.test_user_id}", 200)
        if success and 'user' in response:
            user = response['user']
            print(f"✅ Retrieved user: {user['name']} ({user['email']})")
            print(f"✅ Credits: {user['credits']}, Questions marked: {user['questions_marked']}")
            return True, user
        return False, {}

    def test_update_user(self):
        """Test updating user information"""
        if not self.test_user_id:
            print("❌ No test user ID available")
            return False, {}
            
        update_data = {
            "name": "John Smith Updated",
            "current_plan": "premium"
        }
        
        success, response = self.run_test("Update User Info", "PUT", f"users/{self.test_user_id}", 200, data=update_data)
        if success and 'user' in response:
            user = response['user']
            print(f"✅ Updated user name: {user['name']}")
            print(f"✅ Updated plan: {user['current_plan']}")
            return True, user
        return False, {}

    def test_get_nonexistent_user(self):
        """Test retrieving non-existent user"""
        fake_user_id = "nonexistent_user_123"
        success, response = self.run_test("Get Non-existent User", "GET", f"users/{fake_user_id}", 404)
        return success, response

    # ENHANCED EVALUATION TESTS WITH USER MANAGEMENT
    def test_evaluation_with_user_id(self):
        """Test evaluation with user_id and detailed marking breakdown"""
        if not self.test_user_id:
            print("❌ No test user ID available")
            return False, {}
            
        evaluation_data = {
            "question_type": "igcse_descriptive",
            "user_id": self.test_user_id,
            "student_response": "The ancient castle loomed against the stormy sky, its weathered stones bearing witness to centuries of history. Lightning illuminated the towering battlements while thunder echoed through the empty corridors, creating an atmosphere of mystery and foreboding that seemed to whisper tales of long-forgotten legends.",
            "marking_scheme": None
        }
        
        success, response = self.run_test("Evaluate with User ID", "POST", "evaluate", 200, data=evaluation_data)
        if success:
            print(f"✅ Evaluation stored with user_id: {response.get('user_id')}")
            print(f"✅ Grade: {response.get('grade')}")
            print(f"✅ Reading marks: {response.get('reading_marks')}")
            print(f"✅ Writing marks: {response.get('writing_marks')}")
            print(f"✅ AO1 marks: {response.get('ao1_marks')}")
            print(f"✅ AO2 marks: {response.get('ao2_marks')}")
            return True, response
        return False, {}

    def test_evaluation_summary_with_detailed_marks(self):
        """Test summary evaluation with detailed marking breakdown"""
        if not self.test_user_id:
            print("❌ No test user ID available")
            return False, {}
            
        evaluation_data = {
            "question_type": "igcse_summary",
            "user_id": self.test_user_id,
            "student_response": "The article discusses climate change impacts on global agriculture. Rising temperatures affect crop yields, particularly wheat and rice production. Extreme weather events like droughts and floods damage harvests. Farmers are adapting through drought-resistant crops and improved irrigation systems. International cooperation is essential for food security.",
            "marking_scheme": "Key points: 1. Climate change affects agriculture 2. Temperature impacts on crops 3. Extreme weather damage 4. Farmer adaptation strategies 5. Need for international cooperation"
        }
        
        success, response = self.run_test("Summary with Detailed Marks", "POST", "evaluate", 200, data=evaluation_data)
        if success:
            print(f"✅ Reading marks: {response.get('reading_marks')}")
            print(f"✅ Writing marks: {response.get('writing_marks')}")
            return True, response
        return False, {}

    def test_credit_deduction(self):
        """Test that credits are properly deducted after evaluation"""
        if not self.test_user_id:
            print("❌ No test user ID available")
            return False, {}
            
        # Get user credits before evaluation
        success, user_before = self.run_test("Get User Before Evaluation", "GET", f"users/{self.test_user_id}", 200)
        if not success:
            return False, {}
            
        credits_before = user_before['user']['credits']
        questions_before = user_before['user']['questions_marked']
        
        # Perform evaluation
        evaluation_data = {
            "question_type": "igcse_narrative",
            "user_id": self.test_user_id,
            "student_response": "The mysterious package arrived on a rainy Tuesday morning. Emma hesitated before opening it, her hands trembling with anticipation. Inside, she found an old photograph and a letter that would change her life forever.",
            "marking_scheme": None
        }
        
        success, eval_response = self.run_test("Evaluation for Credit Test", "POST", "evaluate", 200, data=evaluation_data)
        if not success:
            return False, {}
            
        # Get user credits after evaluation
        success, user_after = self.run_test("Get User After Evaluation", "GET", f"users/{self.test_user_id}", 200)
        if not success:
            return False, {}
            
        credits_after = user_after['user']['credits']
        questions_after = user_after['user']['questions_marked']
        
        # Verify credit deduction and question increment
        if credits_after == credits_before - 1:
            print(f"✅ Credits correctly deducted: {credits_before} → {credits_after}")
        else:
            print(f"❌ Credit deduction failed: {credits_before} → {credits_after}")
            
        if questions_after == questions_before + 1:
            print(f"✅ Questions marked correctly incremented: {questions_before} → {questions_after}")
        else:
            print(f"❌ Questions marked increment failed: {questions_before} → {questions_after}")
            
        return credits_after == credits_before - 1 and questions_after == questions_before + 1, user_after

    def test_user_specific_history(self):
        """Test user-specific evaluation history"""
        if not self.test_user_id:
            print("❌ No test user ID available")
            return False, {}
            
        success, response = self.run_test("Get User History", "GET", f"history/{self.test_user_id}", 200)
        if success and 'evaluations' in response:
            evaluations = response['evaluations']
            print(f"✅ Found {len(evaluations)} evaluations for user")
            
            # Verify all evaluations belong to the test user
            for eval_item in evaluations:
                if eval_item.get('user_id') != self.test_user_id:
                    print(f"❌ Found evaluation with wrong user_id: {eval_item.get('user_id')}")
                    return False, response
                    
            print("✅ All evaluations correctly filtered by user_id")
            
            # Check for ObjectId serialization
            for eval_item in evaluations:
                if '_id' in eval_item:
                    if isinstance(eval_item['_id'], str):
                        print("✅ ObjectId correctly serialized to string")
                    else:
                        print(f"❌ ObjectId not serialized: {type(eval_item['_id'])}")
                        return False, response
                        
            return True, response
        return False, {}

    def test_alevel_evaluation_with_ao_marks(self):
        """Test A-Level evaluation with AO1/AO2 marks"""
        if not self.test_user_id:
            print("❌ No test user ID available")
            return False, {}
            
        evaluation_data = {
            "question_type": "alevel_comparative",
            "user_id": self.test_user_id,
            "student_response": "Both texts explore the theme of memory, yet they employ contrasting structural approaches. Text A utilizes a chronological framework that mirrors the natural progression of recollection, while Text B fragments time through flashbacks and stream-of-consciousness techniques. The language in Text A is predominantly nostalgic, employing sensory imagery to evoke childhood memories, whereas Text B adopts a more analytical tone, using metaphorical language to examine the reliability of memory itself.",
            "marking_scheme": "Compare themes, structure, and language techniques between texts focusing on memory and time"
        }
        
        success, response = self.run_test("A-Level Comparative with AO Marks", "POST", "evaluate", 200, data=evaluation_data)
        if success:
            print(f"✅ AO1 marks: {response.get('ao1_marks')}")
            print(f"✅ AO2 marks: {response.get('ao2_marks')}")
            return True, response
        return False, {}

    # INTEGRATION TESTS
    def test_complete_user_flow(self):
        """Test complete user flow: create → evaluate → check history"""
        print("\n🔄 Testing Complete User Flow...")
        
        # Step 1: Create user
        user_data = {
            "user_id": f"flow_test_{uuid.uuid4().hex[:8]}",
            "email": "flow.test@example.com",
            "name": "Flow Test User"
        }
        
        success, user_response = self.run_test("Flow: Create User", "POST", "users", 200, data=user_data)
        if not success:
            return False, {}
            
        flow_user_id = user_response['user']['user_id']
        
        # Step 2: Perform evaluation
        evaluation_data = {
            "question_type": "igcse_writers_effect",
            "user_id": flow_user_id,
            "student_response": "The author's use of the simile 'like a caged bird' effectively conveys the protagonist's sense of entrapment. This comparison creates sympathy in the reader by highlighting the character's desperate desire for freedom. The metaphor 'prison of expectations' further emphasizes the psychological constraints, making the reader understand the internal struggle between duty and personal desires.",
            "marking_scheme": None
        }
        
        success, eval_response = self.run_test("Flow: Evaluate", "POST", "evaluate", 200, data=evaluation_data)
        if not success:
            return False, {}
            
        # Step 3: Check history
        success, history_response = self.run_test("Flow: Check History", "GET", f"history/{flow_user_id}", 200)
        if not success:
            return False, {}
            
        # Verify the evaluation appears in history
        evaluations = history_response.get('evaluations', [])
        if len(evaluations) > 0 and evaluations[0].get('user_id') == flow_user_id:
            print("✅ Complete user flow successful!")
            return True, history_response
        else:
            print("❌ Evaluation not found in user history")
            return False, {}

    # BASIC FUNCTIONALITY TESTS (Updated)
    def test_health_check(self):
        """Test basic API health check"""
        return self.run_test("API Health Check", "GET", "", 200)

    def test_question_types(self):
        """Test question types endpoint"""
        success, response = self.run_test("Get Question Types", "GET", "question-types", 200)
        if success and 'question_types' in response:
            question_types = response['question_types']
            print(f"Found {len(question_types)} question types:")
            for qt in question_types:
                print(f"  - {qt['name']} ({qt['category']}) - Requires marking scheme: {qt['requires_marking_scheme']}")
            return True, question_types
        return False, []



def main():
    print("🚀 Starting English Marking AI Backend Tests - NEW USER MANAGEMENT SYSTEM")
    print("=" * 70)
    
    # Setup
    tester = EnglishMarkingAPITester()
    
    # Run all tests
    print("\n📋 Running NEW User Management Tests...")
    
    # Basic functionality tests
    tester.test_health_check()
    tester.test_question_types()
    
    # NEW USER MANAGEMENT TESTS
    print("\n👤 Testing User Management System...")
    tester.test_create_user()
    tester.test_get_user()
    tester.test_update_user()
    tester.test_get_nonexistent_user()
    
    # ENHANCED EVALUATION TESTS
    print("\n📝 Testing Enhanced Evaluation System...")
    tester.test_evaluation_with_user_id()
    tester.test_evaluation_summary_with_detailed_marks()
    tester.test_alevel_evaluation_with_ao_marks()
    tester.test_credit_deduction()
    
    # USER-SPECIFIC HISTORY TESTS
    print("\n📚 Testing User-Specific History...")
    tester.test_user_specific_history()
    
    # INTEGRATION TESTS
    print("\n🔄 Testing Integration...")
    tester.test_complete_user_flow()
    

    
    # Print results
    print("\n" + "=" * 70)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All NEW user management tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())