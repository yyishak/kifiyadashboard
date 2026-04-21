import json
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    geo_path = root / "src" / "data" / "ethiopiaRegions.json"

    geo = json.loads(geo_path.read_text(encoding="utf-8"))
    features = geo.get("features", [])
    if not isinstance(features, list):
        raise SystemExit("Invalid GeoJSON: features is not a list")

    # Patch set from user-provided polygons.
    # IMPORTANT: Keep `properties.name` aligned with codebase region keys.
    # - Central Ethiopia: matches meta key
    # - Sidama: matches meta key
    # - SWEP: codebase uses key "SWEP" for South West Ethiopia; keep name as "SWEP"
    #         but persist the official label under `officialName`.
    patches_by_name = {
        "Central Ethiopia": {
            "properties": {"name": "Central Ethiopia", "id": "ET-CE"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [37.3000, 7.0000],
                        [38.6500, 7.0000],
                        [38.6500, 8.3500],
                        [37.3000, 8.3500],
                        [37.3000, 7.0000],
                    ]
                ],
            },
        },
        "Sidama": {
            "properties": {"name": "Sidama", "id": "ET-SI"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [36.9800, 5.6200],
                        [39.0000, 5.6200],
                        [39.0000, 7.0000],
                        [36.9800, 7.0000],
                        [36.9800, 5.6200],
                    ]
                ],
            },
        },
        "SWEP": {
            "properties": {"name": "SWEP", "id": "ET-SW", "officialName": "South West Ethiopia Peoples"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [34.5000, 5.3000],
                        [37.0500, 5.3000],
                        [37.0500, 7.8000],
                        [34.5000, 7.8000],
                        [34.5000, 5.3000],
                    ]
                ],
            },
        },
    }

    seen = set()
    updated = 0

    for f in features:
        if not isinstance(f, dict):
            continue
        props = f.get("properties") or {}
        if not isinstance(props, dict):
            props = {}
        name = str(props.get("name") or "").strip()
        if not name or name not in patches_by_name:
            continue

        patch = patches_by_name[name]
        f["type"] = "Feature"
        f["properties"] = patch["properties"]
        f["geometry"] = patch["geometry"]
        seen.add(name)
        updated += 1

    missing = sorted(set(patches_by_name.keys()) - seen)
    if missing:
        raise SystemExit(f"Did not find feature(s) to patch: {', '.join(missing)}")

    geo["features"] = features
    geo_path.write_text(json.dumps(geo, ensure_ascii=False), encoding="utf-8")
    print(f"Patched {updated} feature(s).")


if __name__ == "__main__":
    main()

