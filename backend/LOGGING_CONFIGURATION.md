# Logging Configuration

## Overview
The FastAPI backend has been configured to suppress verbose HTTP/2 protocol debug messages while maintaining useful application logs.

## Problem Solved
Previously, the logs were flooded with messages like:
- `DEBUG:httpcore.http2:send_request_headers.started`
- `DEBUG:hpack.hpack:Adding (b':method', b'GET') to the header table`
- `DEBUG:hpack.hpack:Encoding 70 with 7 bits`

These low-level protocol details made logs hard to read and caused performance issues.

## Solution Implemented

### 1. Centralized Logging Configuration
- Created `logging_config.py` module for centralized control
- Removed duplicate logging configurations from `server.py`
- Set appropriate log levels for different components

### 2. Log Levels by Component

| Component | Log Level | Purpose |
|-----------|-----------|---------|
| Application (`server`) | INFO | Normal application logs |
| `httpcore`, `httpcore.http2` | WARNING | Suppress HTTP/2 debug logs |
| `hpack`, `hpack.hpack` | WARNING | Suppress HPACK encoding logs |
| `httpx`, `urllib3`, `requests` | WARNING | Suppress HTTP client debug logs |
| `PIL`, `PyPDF2` | WARNING | Suppress file processing debug logs |
| `supabase` | INFO | Database operations |
| `uvicorn` | INFO | Server startup/shutdown |

### 3. Environment Variables
Control logging via `.env` file:

```bash
# Set overall application log level
LOG_LEVEL=INFO  # Options: DEBUG, INFO, WARNING, ERROR

# Enable debug mode (separate from log level)
DEBUG=false

# Environment setting
APP_ENV=production
```

## Usage

### Normal Operation (Production)
```bash
# In .env
LOG_LEVEL=INFO
```
Shows:
- ✅ Application INFO, WARNING, ERROR messages
- ✅ Important operational logs
- ❌ HTTP/2 protocol debug messages
- ❌ Low-level library debug output

### Debug Mode (Development)
```bash
# In .env
LOG_LEVEL=DEBUG
```
Shows:
- ✅ All application debug messages
- ✅ Detailed troubleshooting information
- ❌ Still suppresses HTTP/2 protocol noise

### Temporary Debug for Specific Component
In `server.py`, temporarily uncomment:
```python
# logging.getLogger("subscription_service").setLevel(logging.DEBUG)
# logging.getLogger("webhook_processor").setLevel(logging.DEBUG)
```

## Log Format
```
2025-08-24 07:01:39 - module_name - LEVEL - Message
```

## Benefits
1. **Cleaner Logs**: Only relevant application logs appear
2. **Better Performance**: Less I/O from excessive logging
3. **Easier Debugging**: Important messages aren't buried
4. **Smaller Log Files**: Reduced storage requirements
5. **Flexible Control**: Easy to adjust per-component levels

## Monitoring
To verify the configuration is working:
1. Check that HTTP/2 debug messages no longer appear
2. Confirm application INFO logs are still visible
3. Verify ERROR and WARNING messages are captured

## Troubleshooting

### If HTTP/2 logs still appear:
1. Ensure `server.py` uses the updated configuration
2. Restart the application after changes
3. Check for other logging configurations overriding settings

### To temporarily enable all debug logs:
```python
# In server.py, temporarily add:
logging.getLogger().setLevel(logging.DEBUG)
```

### To debug a specific HTTP issue:
```python
# Temporarily in server.py:
logging.getLogger("httpx").setLevel(logging.DEBUG)
```

Remember to revert debug changes before deploying to production!