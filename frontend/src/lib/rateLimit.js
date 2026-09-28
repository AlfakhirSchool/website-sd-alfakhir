// ponytail: in-memory per-IP limiter, good enough for a single-instance school
// site; swap for a shared store (Redis/Upstash) if this ever runs multi-instance.
export function createRateLimiter(windowMs, max) {
    const hits = new Map();
    return (ip) => {
        const now = Date.now();
        const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
        recent.push(now);
        hits.set(ip, recent);
        return recent.length > max;
    };
}
