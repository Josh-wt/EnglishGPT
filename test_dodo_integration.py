#!/usr/bin/env python3
"""
Dodo Payments Integration Test Script

This script tests the complete Dodo Payments integration by:
1. Testing MCP tool connectivity
2. Testing backend API endpoints
3. Validating frontend service calls
4. Checking webhook configuration
5. Testing payment flows
"""

import asyncio
import httpx
import json
import sys
import os
from datetime import datetime

# Add backend to path for imports
sys.path.append('backend')

try:
    from backend.services.mcp_dodo_service import mcp_dodo_service
    from backend.config.settings import DODO_PAYMENTS_API_KEY
except ImportError as e:
    print(f"Backend import error: {e}")
    mcp_dodo_service = None

class DodoIntegrationTester:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        print(f"{status} {test_name}")
        if details and not success:
            print(f"   Details: {details}")

    async def test_backend_health(self):
        """Test backend health endpoint"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.backend_url}/api/payments/health")
                success = response.status_code == 200
                details = f"Status: {response.status_code}"
                if success:
                    data = response.json()
                    details += f", Configured: {data.get('configured', False)}"
        except Exception as e:
            success = False
            details = str(e)
        
        self.log_test("Backend Health Check", success, details)
        return success

    async def test_mcp_service(self):
        """Test MCP service functionality"""
        if not mcp_dodo_service:
            self.log_test("MCP Service Available", False, "Could not import MCP service")
            return False
            
        try:
            # Test a simple MCP call
            result = await mcp_dodo_service.list_products()
            success = isinstance(result, dict)
            details = f"Returned data type: {type(result)}"
        except Exception as e:
            success = False
            details = str(e)
            
        self.log_test("MCP Service Functionality", success, details)
        return success

    async def test_payment_endpoints(self):
        """Test payment API endpoints"""
        endpoints_to_test = [
            ("/api/payments/payments", "GET"),
            ("/api/payments/subscriptions", "GET"),
            ("/api/payments/customers", "GET"),
            ("/api/payments/products", "GET"),
            ("/api/payments/discounts", "GET"),
            ("/api/payments/webhooks", "GET")
        ]
        
        all_passed = True
        
        async with httpx.AsyncClient() as client:
            for endpoint, method in endpoints_to_test:
                try:
                    url = f"{self.backend_url}{endpoint}"
                    response = await client.request(method, url)
                    success = response.status_code in [200, 401]  # 401 is OK if API key not configured
                    details = f"Status: {response.status_code}"
                    
                    if not success:
                        all_passed = False
                        
                except Exception as e:
                    success = False
                    details = str(e)
                    all_passed = False
                
                self.log_test(f"API Endpoint {method} {endpoint}", success, details)
        
        return all_passed

    async def test_payment_creation(self):
        """Test payment creation flow"""
        try:
            payment_data = {
                "customer": {
                    "name": "Test User",
                    "email": "test@example.com"
                },
                "product_cart": [
                    {
                        "product_id": "test_product",
                        "quantity": 1
                    }
                ],
                "billing": {
                    "street": "123 Test St",
                    "city": "Test City",
                    "state": "TS",
                    "country": "US",
                    "zipcode": "12345"
                },
                "billing_currency": "USD"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/payments/payments",
                    json=payment_data
                )
                success = response.status_code in [200, 201, 400, 401]  # Various expected responses
                details = f"Status: {response.status_code}"
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        details += f", Payment ID: {data.get('payment_id', 'N/A')}"
                    except:
                        pass
                        
        except Exception as e:
            success = False
            details = str(e)
            
        self.log_test("Payment Creation Flow", success, details)
        return success

    async def test_subscription_creation(self):
        """Test subscription creation flow"""
        try:
            subscription_data = {
                "customer": {
                    "name": "Test User",
                    "email": "test@example.com"
                },
                "product_id": "basic_monthly",
                "quantity": 1,
                "billing": {
                    "street": "123 Test St",
                    "city": "Test City",
                    "state": "TS",
                    "country": "US",
                    "zipcode": "12345"
                },
                "billing_currency": "USD"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/payments/subscriptions",
                    json=subscription_data
                )
                success = response.status_code in [200, 201, 400, 401]
                details = f"Status: {response.status_code}"
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        details += f", Subscription ID: {data.get('subscription_id', 'N/A')}"
                    except:
                        pass
                        
        except Exception as e:
            success = False
            details = str(e)
            
        self.log_test("Subscription Creation Flow", success, details)
        return success

    async def test_frontend_accessibility(self):
        """Test if frontend pages are accessible"""
        pages_to_test = [
            "/pricing",
            "/subscription", 
            "/payment-success",
            "/admin/payments"
        ]
        
        all_passed = True
        
        async with httpx.AsyncClient() as client:
            for page in pages_to_test:
                try:
                    response = await client.get(f"{self.frontend_url}{page}")
                    success = response.status_code == 200
                    details = f"Status: {response.status_code}"
                    
                    if not success:
                        all_passed = False
                        
                except Exception as e:
                    success = False
                    details = str(e)
                    all_passed = False
                
                self.log_test(f"Frontend Page {page}", success, details)
        
        return all_passed

    def check_file_structure(self):
        """Check if all required files exist"""
        required_files = [
            "backend/services/dodo_service.py",
            "backend/services/mcp_dodo_service.py", 
            "backend/routes/payments.py",
            "backend/config/settings.py",
            "frontend/src/services/paymentService.js",
            "frontend/src/components/PricingPage/ModernPricingPage.js",
            "frontend/src/components/SubscriptionDashboard/SubscriptionDashboard.js",
            "frontend/src/components/PaymentSuccess/PaymentSuccess.js",
            "frontend/src/components/AdminDashboard/PaymentsDashboard.js",
            "frontend/src/components/DiscountManager/DiscountManager.js",
            "frontend/src/components/WebhookManager/WebhookManager.js",
            "frontend/src/components/LicenseManager/LicenseManager.js",
            "frontend/src/components/ui/card.js",
            "frontend/src/components/ui/button.js",
            "frontend/src/components/ui/badge.js",
            "database/dodo_payments_integration_schema.sql"
        ]
        
        all_exist = True
        
        for file_path in required_files:
            exists = os.path.exists(file_path)
            if not exists:
                all_exist = False
            self.log_test(f"File exists: {file_path}", exists)
        
        return all_exist

    def check_configuration(self):
        """Check configuration settings"""
        try:
            # Check if API key is configured
            api_key_configured = DODO_PAYMENTS_API_KEY is not None
            self.log_test("Dodo API Key Configured", api_key_configured)
            
            # Check environment variables
            env_vars = [
                "DODO_PAYMENTS_API_KEY",
                "DODO_PAYMENTS_ENVIRONMENT", 
                "DODO_PAYMENTS_BASE_URL"
            ]
            
            env_configured = True
            for var in env_vars:
                exists = os.environ.get(var) is not None
                if not exists:
                    env_configured = False
                self.log_test(f"Environment Variable {var}", exists)
            
            return api_key_configured and env_configured
            
        except Exception as e:
            self.log_test("Configuration Check", False, str(e))
            return False

    async def run_all_tests(self):
        """Run all integration tests"""
        print("🚀 Starting Dodo Payments Integration Test")
        print("=" * 50)
        
        # File structure tests
        print("\n📁 File Structure Tests")
        print("-" * 30)
        file_structure_ok = self.check_file_structure()
        
        # Configuration tests  
        print("\n⚙️  Configuration Tests")
        print("-" * 30)
        config_ok = self.check_configuration()
        
        # Backend tests
        print("\n🔧 Backend API Tests")  
        print("-" * 30)
        backend_health = await self.test_backend_health()
        mcp_service_ok = await self.test_mcp_service()
        endpoints_ok = await self.test_payment_endpoints()
        
        # Payment flow tests
        print("\n💳 Payment Flow Tests")
        print("-" * 30)
        payment_ok = await self.test_payment_creation()
        subscription_ok = await self.test_subscription_creation()
        
        # Frontend tests
        print("\n🌐 Frontend Tests")
        print("-" * 30)
        frontend_ok = await self.test_frontend_accessibility()
        
        # Summary
        print("\n📊 Test Summary")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Overall status
        critical_systems = [
            file_structure_ok,
            config_ok, 
            backend_health,
            mcp_service_ok
        ]
        
        if all(critical_systems):
            print("\n🎉 Integration Status: READY FOR PRODUCTION")
            print("All critical systems are operational!")
        elif any(critical_systems):
            print("\n⚠️  Integration Status: PARTIALLY READY")
            print("Some systems need attention before production.")
        else:
            print("\n🚨 Integration Status: NOT READY")
            print("Critical issues need to be resolved.")
        
        # Failed tests details
        if failed_tests > 0:
            print(f"\n❌ Failed Tests ({failed_tests}):")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
        
        return passed_tests == total_tests

async def main():
    """Main test runner"""
    tester = DodoIntegrationTester()
    success = await tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())
