from typing import Protocol, runtime_checkable
from app.models.schemas import RegistryCheckResult

@runtime_checkable
class RegistryProvider(Protocol):
    async def verify_registry(self, company_name: str, country: str | None = None, state: str | None = None) -> RegistryCheckResult:
        """Query official commercial registry for corporate entity verification."""
        ...

class DemoRegistryProvider:
    """
    Synthetic demo registry verification provider.
    Demonstrates state/national corporate entity verification without hitting live state filings.
    """
    async def verify_registry(self, company_name: str, country: str | None = "United States", state: str | None = None) -> RegistryCheckResult:
        clean_name = company_name.strip()
        
        # Test edge-cases
        if "novaworks" in clean_name.lower() or "unverified" in clean_name.lower() or "fake" in clean_name.lower():
            return RegistryCheckResult(
                country=country or "United States",
                registry_name="State Corporate Registry Database",
                registry_type="State Secretary of State Registry",
                status="unable_to_verify",
                evidence="No active corporate charter or matching entity found in official commercial records.",
                trust_level="DEMO",
                notes="Unable to verify legal registration. Reduced confidence applied."
            )

        if "orion" in clean_name.lower():
            return RegistryCheckResult(
                country=country or "United States",
                registry_name="Massachusetts Corporations Division",
                registry_type="State Corporate Registry",
                status="partially_verified",
                legal_name=f"{clean_name} LLC",
                jurisdiction="Commonwealth of Massachusetts",
                evidence="Synthetic Demo Data: Found multiple dissolved DBAs and parent holding structure.",
                trust_level="DEMO",
                source_url="https://corp.demo.sec.state.ma.us/corpweb/corpsearch",
                notes="Ambiguous entity match; manual clerk verification recommended."
            )

        # Default verified
        jurisdiction = f"{state or 'Delaware / California'}, {country or 'United States'}"
        return RegistryCheckResult(
            country=country or "United States",
            registry_name="Official Commercial Registry",
            registry_type="State Secretary of State Corporate Division",
            status="verified",
            legal_name=f"{clean_name} Inc.",
            jurisdiction=jurisdiction,
            evidence=f"Synthetic Demo Data: Active corporation in Good Standing. Entity charter active.",
            trust_level="DEMO",
            source_url="https://demo-registry.example.gov/search",
            notes="Corporate registration verified active. Synthetic Demo Data created for AgenticFlow."
        )

def get_registry_provider(demo_mode: bool = True) -> RegistryProvider:
    return DemoRegistryProvider()
