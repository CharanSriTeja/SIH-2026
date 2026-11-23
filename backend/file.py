import requests

url = (
    "https://www.mosdac.gov.in/opendata/GSMaP_SAC_RAIN/2026/GPMMRG_MAP_2608161200_H_L3S_MCH_03F.h5"
)

response = requests.get(
    url,
    timeout=60,
    allow_redirects=True,
)

print("Status:", response.status_code)
print("Final URL:", response.url)
print("Content-Type:", response.headers.get("Content-Type"))
print("Size:", len(response.content))

print("\nFirst 20 bytes:")
print(response.content[:20])