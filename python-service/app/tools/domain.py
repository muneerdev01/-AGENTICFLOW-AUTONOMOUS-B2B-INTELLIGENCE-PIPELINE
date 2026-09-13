import ipaddress
import socket
import time
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
from app.models.schemas import DomainCheckResult

def is_safe_host(hostname: str) -> tuple[bool, str]:
    """
    SSRF Protection Guard:
    Checks whether a hostname or IP is safe to probe.
    Blocks localhost, private networks, cloud metadata, link-local, and reserved ranges.
    """
    clean_host = hostname.strip().lower()
    
    if clean_host in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
        return False, "SSRF blocked: Localhost resolution prohibited."
    
    if clean_host.endswith(".local") or clean_host.endswith(".internal"):
        return False, "SSRF blocked: Local/Internal domain prohibited."

    try:
        # Check if direct IP
        ip = ipaddress.ip_address(clean_host)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False, f"SSRF blocked: Prohibited IP address range ({ip})."
    except ValueError:
        # Hostname - resolve DNS safely
        try:
            resolved_ips = socket.getaddrinfo(clean_host, None)
            for item in resolved_ips:
                sockaddr = item[4]
                ip_str = sockaddr[0]
                ip = ipaddress.ip_address(ip_str)
                if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                    return False, f"SSRF blocked: Resolved to non-routable address ({ip_str})."
        except socket.gaierror:
            # Domain cannot be resolved
            return False, "DNS resolution failed: Domain not found."

    return True, "Safe"

async def verify_domain_status(domain: str, is_demo_mode: bool = True) -> DomainCheckResult:
    """
    Performs domain validation and probing with strict SSRF controls.
    In Demo Mode, generates deterministic synthetic probe results.
    """
    clean_domain = domain.replace("https://", "").replace("http://", "").split("/")[0].strip()
    
    if not clean_domain:
        return DomainCheckResult(
            domain=domain,
            status="INVALID",
            syntax_valid=False,
            https_available=False,
            http_status=0,
            notes="Domain string is empty."
        )

    # In Demo Mode, simulate probe deterministically
    if is_demo_mode or "demo" in clean_domain:
        if "invalid" in clean_domain or "fail" in clean_domain or clean_domain.endswith(".biz"):
            return DomainCheckResult(
                domain=clean_domain,
                status="UNREACHABLE",
                syntax_valid=True,
                https_available=False,
                http_status=502,
                response_time_ms=850,
                ssrf_passed=True,
                notes="Synthetic Demo Source: Domain probe simulated HTTP 502 Bad Gateway."
            )
        
        return DomainCheckResult(
            domain=clean_domain,
            status="VALID",
            syntax_valid=True,
            https_available=True,
            http_status=200,
            final_url=f"https://{clean_domain}",
            redirect_count=1 if clean_domain.startswith("www.") else 0,
            page_title=f"{clean_domain.split('.')[0].replace('-', ' ').title()} | Official Website",
            response_time_ms=138,
            server_header="cloudflare",
            ssrf_passed=True,
            notes="Synthetic Demo Source: Synthetic probe successful. TLS 1.3 negotiated."
        )

    # Live verification with SSRF protection
    safe, reason = is_safe_host(clean_domain)
    if not safe:
        return DomainCheckResult(
            domain=clean_domain,
            status="INVALID",
            syntax_valid=True,
            https_available=False,
            http_status=0,
            ssrf_passed=False,
            notes=reason
        )

    start_time = time.time()
    target_url = f"https://{clean_domain}"
    
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            max_redirects=3,
            timeout=5.0,
            headers={"User-Agent": "AgenticFlow-Verifier/1.0 (Autonomous B2B Pipeline)"}
        ) as client:
            resp = await client.get(target_url)
            elapsed = int((time.time() - start_time) * 1000)
            
            soup = BeautifulSoup(resp.text[:50000], "html.parser")
            title = soup.title.string.strip() if soup.title and soup.title.string else None
            
            return DomainCheckResult(
                domain=clean_domain,
                status="VALID" if resp.status_code < 400 else "UNREACHABLE",
                syntax_valid=True,
                https_available=str(resp.url).startswith("https://"),
                http_status=resp.status_code,
                final_url=str(resp.url),
                redirect_count=len(resp.history),
                page_title=title,
                response_time_ms=elapsed,
                server_header=resp.headers.get("server"),
                ssrf_passed=True,
                notes=f"HTTP {resp.status_code} received in {elapsed}ms."
            )
    except Exception as e:
        elapsed = int((time.time() - start_time) * 1000)
        return DomainCheckResult(
            domain=clean_domain,
            status="UNREACHABLE",
            syntax_valid=True,
            https_available=False,
            http_status=0,
            response_time_ms=elapsed,
            ssrf_passed=True,
            notes=f"Connection probe failed: {str(e)[:100]}"
        )
