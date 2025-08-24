#!/usr/bin/env python3
"""
Webhook System Monitoring Script
Monitors the health and performance of the Dodo Payments webhook integration
"""

import requests
import time
import json
import logging
from datetime import datetime, timedelta
import os
import psutil

# Configuration
WEBHOOK_SERVICE_URL = os.getenv('WEBHOOK_SERVICE_URL', 'http://localhost:3001')
PYTHON_API_URL = os.getenv('PYTHON_API_URL', 'http://localhost:8000')
ALERT_EMAIL = os.getenv('ALERT_EMAIL', 'admin@englishgpt.com')

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/webhook-monitor.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class WebhookMonitor:
    def __init__(self):
        self.alerts_sent = {}  # Track sent alerts to avoid spam
        self.alert_cooldown = 300  # 5 minutes cooldown between same alerts
        
    def check_service_health(self, service_name, url, endpoint='/health'):
        """Check if a service is healthy"""
        try:
            response = requests.get(f"{url}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'healthy': True,
                    'response_time': response.elapsed.total_seconds(),
                    'data': data
                }
            else:
                return {
                    'healthy': False,
                    'error': f"HTTP {response.status_code}",
                    'response_time': response.elapsed.total_seconds()
                }
                
        except Exception as e:
            return {
                'healthy': False,
                'error': str(e),
                'response_time': None
            }
    
    def check_system_resources(self):
        """Check system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_gb': memory.available / (1024**3),
                'disk_percent': disk.percent,
                'disk_free_gb': disk.free / (1024**3)
            }
        except Exception as e:
            return {'error': str(e)}
    
    def check_docker_containers(self):
        """Check Docker container status"""
        try:
            import docker
            client = docker.from_env()
            containers = client.containers.list(all=True)
            
            status = {}
            for container in containers:
                if 'englishgpt' in container.name or 'dodo' in container.name:
                    status[container.name] = {
                        'status': container.status,
                        'health': getattr(container.attrs['State'], 'Health', {}).get('Status', 'unknown')
                    }
            
            return status
        except Exception as e:
            return {'error': str(e)}
    
    def send_alert(self, subject, message, severity='WARNING'):
        """Send alert notification"""
        alert_key = f"{subject}_{severity}"
        current_time = time.time()
        
        # Check cooldown
        if (alert_key in self.alerts_sent and 
            current_time - self.alerts_sent[alert_key] < self.alert_cooldown):
            return False
        
        # Log the alert
        logger.warning(f"ALERT [{severity}]: {subject} - {message}")
        self.alerts_sent[alert_key] = current_time
        return True
    
    def run_health_checks(self):
        """Run all health checks and report status"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'overall_healthy': True,
            'services': {},
            'system': {},
            'alerts': []
        }
        
        # Check webhook service
        webhook_health = self.check_service_health('webhook-service', WEBHOOK_SERVICE_URL)
        results['services']['webhook_service'] = webhook_health
        
        if not webhook_health['healthy']:
            results['overall_healthy'] = False
            results['alerts'].append('Webhook service is unhealthy')
            self.send_alert(
                'Webhook Service Down',
                f"Webhook service health check failed: {webhook_health.get('error', 'Unknown error')}",
                'CRITICAL'
            )
        
        # Check Python API
        api_health = self.check_service_health('python-api', PYTHON_API_URL, '/api/webhooks/health')
        results['services']['python_api'] = api_health
        
        if not api_health['healthy']:
            results['overall_healthy'] = False
            results['alerts'].append('Python API is unhealthy')
            self.send_alert(
                'Python API Down',
                f"Python API health check failed: {api_health.get('error', 'Unknown error')}",
                'CRITICAL'
            )
        
        # Check system resources
        system_stats = self.check_system_resources()
        results['system'] = system_stats
        
        if 'error' not in system_stats:
            # Alert on high resource usage
            if system_stats['cpu_percent'] > 80:
                results['alerts'].append(f"High CPU usage: {system_stats['cpu_percent']:.1f}%")
                self.send_alert(
                    'High CPU Usage',
                    f"CPU usage is at {system_stats['cpu_percent']:.1f}%"
                )
            
            if system_stats['memory_percent'] > 85:
                results['alerts'].append(f"High memory usage: {system_stats['memory_percent']:.1f}%")
                self.send_alert(
                    'High Memory Usage',
                    f"Memory usage is at {system_stats['memory_percent']:.1f}%"
                )
            
            if system_stats['disk_percent'] > 90:
                results['alerts'].append(f"Low disk space: {system_stats['disk_percent']:.1f}% used")
                self.send_alert(
                    'Low Disk Space',
                    f"Disk usage is at {system_stats['disk_percent']:.1f}%",
                    'CRITICAL'
                )
        
        # Check Docker containers
        container_stats = self.check_docker_containers()
        results['containers'] = container_stats
        
        if 'error' not in container_stats:
            for container_name, status in container_stats.items():
                if status['status'] != 'running':
                    results['overall_healthy'] = False
                    results['alerts'].append(f"Container {container_name} is {status['status']}")
                    self.send_alert(
                        f'Container {container_name} Down',
                        f"Container {container_name} status: {status['status']}",
                        'CRITICAL'
                    )
        
        return results
    
    def log_results(self, results):
        """Log monitoring results"""
        status = "HEALTHY" if results['overall_healthy'] else "UNHEALTHY"
        logger.info(f"Health Check Complete - Status: {status}")
        
        if results['alerts']:
            logger.warning(f"Alerts: {', '.join(results['alerts'])}")
        
        # Log performance metrics
        webhook_response_time = results['services']['webhook_service'].get('response_time')
        api_response_time = results['services']['python_api'].get('response_time')
        
        if webhook_response_time:
            logger.info(f"Webhook service response time: {webhook_response_time:.3f}s")
        if api_response_time:
            logger.info(f"API service response time: {api_response_time:.3f}s")
    
    def generate_report(self, results):
        """Generate detailed monitoring report"""
        report = f"""
=== EnglishGPT Webhook System Health Report ===
Generated: {results['timestamp']}
Overall Status: {'HEALTHY' if results['overall_healthy'] else 'UNHEALTHY'}

🔧 Services:
- Webhook Service: {'✅' if results['services']['webhook_service']['healthy'] else '❌'} 
  Response Time: {results['services']['webhook_service'].get('response_time', 'N/A')}s
  
- Python API: {'✅' if results['services']['python_api']['healthy'] else '❌'}
  Response Time: {results['services']['python_api'].get('response_time', 'N/A')}s

💻 System Resources:
- CPU Usage: {results['system'].get('cpu_percent', 'N/A')}%
- Memory Usage: {results['system'].get('memory_percent', 'N/A')}%
- Disk Usage: {results['system'].get('disk_percent', 'N/A')}%

🐳 Docker Containers:
"""
        
        if 'error' not in results.get('containers', {}):
            for name, status in results['containers'].items():
                report += f"- {name}: {status['status']} ({'✅' if status['status'] == 'running' else '❌'})\n"
        
        if results['alerts']:
            report += f"\n🚨 Active Alerts:\n"
            for alert in results['alerts']:
                report += f"- {alert}\n"
        else:
            report += "\n✅ No active alerts\n"
        
        return report

def main():
    """Main monitoring function"""
    monitor = WebhookMonitor()
    
    logger.info("Starting webhook system monitoring...")
    
    while True:
        try:
            results = monitor.run_health_checks()
            monitor.log_results(results)
            
            # Save results to file for dashboard
            with open('/var/log/webhook-health.json', 'w') as f:
                json.dump(results, f, indent=2)
            
            # Print summary report every 10th check
            if int(time.time()) % 600 == 0:  # Every 10 minutes
                report = monitor.generate_report(results)
                logger.info(f"Detailed Report:\n{report}")
            
        except Exception as e:
            logger.error(f"Monitoring error: {e}")
            monitor.send_alert(
                'Monitoring System Error',
                f"Webhook monitoring encountered an error: {str(e)}",
                'WARNING'
            )
        
        # Wait 60 seconds before next check
        time.sleep(60)

if __name__ == "__main__":
    main()