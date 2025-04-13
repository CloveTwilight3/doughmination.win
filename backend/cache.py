import time

_cache = {}

def get_from_cache(key):
    if key in _cache:
        value, expire_time = _cache[key]
        if time.time() < expire_time:
            return value
        else:
            del _cache[key]  # expired
    return None

def set_in_cache(key, value, ttl=30):
    expire_time = time.time() + ttl
    _cache[key] = (value, expire_time)
