import json
import re
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    meta_path = root / "src" / "data" / "ethiopiaRegionMeta.ts"
    geo_path = root / "src" / "data" / "ethiopiaRegions.json"

    meta_src = meta_path.read_text(encoding="utf-8")
    meta_keys = re.findall(r'key:\s*"([^"]+)"', meta_src)

    geo = json.loads(geo_path.read_text(encoding="utf-8"))
    geo_names = []
    for f in geo.get("features", []):
        props = f.get("properties") or {}
        name = str(props.get("name") or "").strip()
        if name:
            geo_names.append(name)

    meta_set = set(meta_keys)
    geo_set = set(geo_names)

    missing = sorted(meta_set - geo_set)
    extra = sorted(geo_set - meta_set)

    print("meta:", len(meta_keys))
    print("geojson:", len(geo_names))
    print("missing_in_geojson:", ", ".join(missing) if missing else "(none)")
    print("extra_in_geojson:", ", ".join(extra) if extra else "(none)")


if __name__ == "__main__":
    main()

