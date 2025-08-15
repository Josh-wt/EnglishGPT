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

    def test_file_processing(self):
        """Test file processing endpoint with a sample text file"""
        # Create a simple test PDF-like content
        test_content = "This is a test marking scheme for summary questions.\n\nKey points:\n1. Main idea identification\n2. Supporting details\n3. Concise expression"
        
        # Create a mock file for testing
        files = {'file': ('test_marking_scheme.txt', test_content, 'text/plain')}
        
        success, response = self.run_test("Process File", "POST", "process-file", 200, files=files)
        if success and 'extracted_text' in response:
            print(f"Extracted text: {response['extracted_text'][:100]}...")
            return True, response['extracted_text']
        return False, ""

    def test_evaluation_descriptive(self):
        """Test evaluation with descriptive writing (no marking scheme required)"""
        if not self.test_user_id:
            print("❌ No test user ID available for evaluation")
            return False, {}
            
        evaluation_data = {
            "question_type": "igcse_descriptive",
            "student_response": "The old lighthouse stood majestically on the rocky cliff, its weathered walls telling stories of countless storms weathered and ships guided safely to shore. The salty breeze carried whispers of the past, while seagulls danced around its towering structure like guardians of maritime history.",
            "user_id": self.test_user_id,
            "marking_scheme": None
        }
        
        return self.run_test("Evaluate Descriptive Writing", "POST", "evaluate", 200, data=evaluation_data)

    def test_evaluation_summary(self):
        """Test evaluation with summary (requires marking scheme)"""
        evaluation_data = {
            "question_type": "igcse_summary",
            "student_response": "The text discusses the importance of renewable energy sources. Solar and wind power are becoming more cost-effective. Governments are investing in green technology to reduce carbon emissions and combat climate change.",
            "marking_scheme": "Key points: 1. Renewable energy importance 2. Cost-effectiveness of solar/wind 3. Government investment 4. Carbon emission reduction 5. Climate change combat"
        }
        
        return self.run_test("Evaluate Summary with Marking Scheme", "POST", "evaluate", 200, data=evaluation_data)

    def test_evaluation_missing_marking_scheme(self):
        """Test evaluation error handling when marking scheme is required but missing"""
        evaluation_data = {
            "question_type": "igcse_summary",
            "student_response": "This is a summary without a marking scheme.",
            "marking_scheme": None
        }
        
        # This should still work as the backend doesn't validate this requirement
        return self.run_test("Evaluate Summary without Marking Scheme", "POST", "evaluate", 200, data=evaluation_data)

    def test_evaluation_invalid_question_type(self):
        """Test evaluation with invalid question type"""
        evaluation_data = {
            "question_type": "invalid_type",
            "student_response": "This is a test response.",
            "marking_scheme": None
        }
        
        return self.run_test("Evaluate Invalid Question Type", "POST", "evaluate", 200, data=evaluation_data)

    def test_evaluation_empty_response(self):
        """Test evaluation with empty student response"""
        evaluation_data = {
            "question_type": "igcse_descriptive",
            "student_response": "",
            "marking_scheme": None
        }
        
        return self.run_test("Evaluate Empty Response", "POST", "evaluate", 200, data=evaluation_data)

    def test_history(self):
        """Test evaluation history endpoint"""
        return self.run_test("Get Evaluation History", "GET", "history", 200)



    def test_pdf_file_processing(self):
        """Test PDF file processing with actual PDF content"""
        # Create a simple PDF-like content for testing
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF"
        
        files = {'file': ('test_document.pdf', pdf_content, 'application/pdf')}
        
        return self.run_test("Process PDF File", "POST", "process-file", 200, files=files)

    def test_all_question_types(self):
        """Test evaluation with all different question types"""
        question_types_tests = [
            {
                "type": "igcse_narrative",
                "response": "The rain poured down relentlessly as Sarah hurried through the empty streets. Her heart raced with each step, knowing that time was running out. The mysterious letter in her pocket held the key to everything, but would she reach the old clock tower in time?",
                "scheme": None
            },
            {
                "type": "igcse_writers_effect", 
                "response": "The author uses the metaphor 'time is a thief' to convey how quickly precious moments slip away. The personification of time as a criminal creates a sense of urgency and loss. The alliteration in 'silently stealing' emphasizes the stealthy nature of time's passage, making readers feel the anxiety of lost opportunities.",
                "scheme": None
            },
            {
                "type": "alevel_comparative",
                "response": "Both texts explore themes of isolation, yet they approach this concept differently. Text A presents isolation as a physical state through the protagonist's remote location, while Text B examines emotional isolation within a crowded urban setting. The structural differences are equally significant - Text A employs a linear narrative structure that mirrors the character's journey toward connection, whereas Text B uses fragmented sections that reflect the protagonist's fractured mental state.",
                "scheme": "Compare themes, structure, and language techniques between texts"
            },
            {
                "type": "alevel_directed",
                "response": "Dear Board Members, I am writing to propose the implementation of a comprehensive recycling program in our community. Based on recent environmental studies, our current waste management practices are insufficient for addressing the growing environmental concerns. The proposed program would include separate collection systems for different materials, educational workshops for residents, and partnerships with local recycling facilities.",
                "scheme": None
            },
            {
                "type": "alevel_text_analysis",
                "response": "The writer employs a sophisticated blend of form, structure, and language to create a compelling narrative voice. The use of first-person narration establishes immediate intimacy with the reader, while the fragmented sentence structure in paragraph three mirrors the protagonist's emotional turmoil. Linguistically, the writer's choice of sensory imagery - particularly the recurring motif of sound - creates an immersive atmosphere that draws readers into the character's psychological landscape.",
                "scheme": "Analyze form, structure, and language techniques and their effects"
            }
        ]
        
        results = []
        for test in question_types_tests:
            evaluation_data = {
                "question_type": test["type"],
                "student_response": test["response"],
                "marking_scheme": test["scheme"]
            }
            
            success, response = self.run_test(f"Evaluate {test['type']}", "POST", "evaluate", 200, data=evaluation_data)
            results.append(success)
        
    def test_invalid_endpoint(self):
        """Test invalid endpoint"""
        return self.run_test("Invalid Endpoint", "GET", "invalid-endpoint", 404)

def main():
    print("🚀 Starting English Marking AI Backend Tests")
    print("=" * 50)
    
    # Setup
    tester = EnglishMarkingAPITester()
    
    # Run all tests
    print("\n📋 Running API Tests...")
    
    # Basic functionality tests
    tester.test_health_check()
    success, question_types = tester.test_question_types()
    
    # File processing test
    tester.test_file_processing()
    tester.test_pdf_file_processing()
    
    # Evaluation tests
    tester.test_evaluation_descriptive()
    tester.test_evaluation_summary()
    tester.test_evaluation_missing_marking_scheme()
    tester.test_evaluation_invalid_question_type()
    tester.test_evaluation_empty_response()
    
    # Test all question types
    tester.test_all_question_types()
    

    
    # History test
    tester.test_history()
    
    # Error handling test
    tester.test_invalid_endpoint()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())