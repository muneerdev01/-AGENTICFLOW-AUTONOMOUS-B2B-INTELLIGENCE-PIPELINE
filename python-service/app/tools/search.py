import time
from typing import Protocol, runtime_checkable
import httpx
from bs4 import BeautifulSoup
from app.models.schemas import SearchResult

@runtime_checkable
class SearchProvider(Protocol):
    async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
        """Perform search query and return normalized SearchResult list."""
        ...

class DemoSearchProvider:
    """
    Deterministic $0 demo search provider.
    Never calls external networks; labels all output as Synthetic Demo Source.
    """
    async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
        q_clean = query.lower()
        results = [
            SearchResult(
                title=f"{query} | Verified Company Overview",
                url="https://demo.example.com/company-profile",
                snippet="Synthetic Demo Source: Enterprise corporate entity registered for B2B intelligence workflow testing in AgenticFlow.",
                source="Demo Search Provider",
                source_type="demo",
                trust_level="DEMO"
            ),
            SearchResult(
                title=f"{query} | Industry Solutions & Directory Profile",
                url="https://directories.demo.example.com/listings",
                snippet="Synthetic Demo Source: B2B service directory profile outlining cloud architecture, team scale, and enterprise capabilities.",
                source="Established Business Directory (Demo)",
                source_type="demo",
                trust_level="DEMO"
            ),
            SearchResult(
                title=f"Corporate Filings & Public Disclosures: {query}",
                url="https://demo-registry.example.gov/records",
                snippet="Synthetic Demo Source: State business registry search index entry confirming active legal standing and principal executive listings.",
                source="Public Registry Index (Demo)",
                source_type="demo",
                trust_level="DEMO"
            )
        ]
        return results[:max_results]

class TavilySearchProvider:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://api.tavily.com/search"

    async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                self.endpoint,
                json={"api_key": self.api_key, "query": query, "max_results": max_results}
            )
            resp.raise_for_status()
            data = resp.json()
            
            results = []
            for item in data.get("results", []):
                results.append(
                    SearchResult(
                        title=item.get("title", "Search Result"),
                        url=item.get("url", "https://example.com"),
                        snippet=item.get("content", "")[:300],
                        source="Tavily Search API",
                        source_type="news",
                        trust_level="MEDIUM"
                    )
                )
            return results

class DuckDuckGoSearchProvider:
    """Fallback search provider using DuckDuckGo public HTML."""
    async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        async with httpx.AsyncClient(timeout=6.0, headers=headers) as client:
            resp = await client.post("https://html.duckduckgo.com/html/", data={"q": query})
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            
            results = []
            for link in soup.select(".result__snippet")[:max_results]:
                parent = link.find_parent("div", class_="result")
                title_elem = parent.select_one(".result__title") if parent else None
                url_elem = parent.select_one(".result__url") if parent else None
                
                title = title_elem.get_text().strip() if title_elem else "Result"
                url = url_elem.get_text().strip() if url_elem else "https://duckduckgo.com"
                if not url.startswith("http"):
                    url = f"https://{url}"
                snippet = link.get_text().strip()
                
                results.append(
                    SearchResult(
                        title=title,
                        url=url,
                        snippet=snippet,
                        source="DuckDuckGo Search",
                        source_type="directory",
                        trust_level="MEDIUM"
                    )
                )
            return results

def get_search_provider(demo_mode: bool = True, provider_name: str = "demo", tavily_key: str | None = None) -> SearchProvider:
    """
    Search Provider Selection Chain:
    If demo_mode -> DemoSearchProvider
    Else if Tavily configured -> TavilySearchProvider with fallback
    Else -> DuckDuckGo with fallback to DemoSearchProvider
    """
    if demo_mode:
        return DemoSearchProvider()
        
    if provider_name == "tavily" and tavily_key:
        return TavilySearchProvider(api_key=tavily_key)
        
    if provider_name == "duckduckgo":
        return DuckDuckGoSearchProvider()
        
    return DemoSearchProvider()
