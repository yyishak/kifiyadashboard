import json
import math
from pathlib import Path


def circle_polygon(lon: float, lat: float, r_deg: float = 1.0, points: int = 28):
    # Simple "circle" in lon/lat degrees (placeholder, not a geodesic buffer).
    # Coordinates must be closed (first == last).
    coords = []
    for i in range(points):
        a = (i / points) * (2 * math.pi)
        x = lon + math.cos(a) * r_deg
        y = lat + math.sin(a) * r_deg
        coords.append([round(x, 6), round(y, 6)])
    coords.append(coords[0])
    return coords


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    geo_path = root / "src" / "data" / "ethiopiaRegions.json"

    geo = json.loads(geo_path.read_text(encoding="utf-8"))
    if geo.get("type") != "FeatureCollection":
        raise SystemExit("ethiopiaRegions.json is not a FeatureCollection")

    features = geo.setdefault("features", [])
    existing = {((f.get("properties") or {}).get("name") or "").strip() for f in features}

    placeholders = [
        ("Central Ethiopia", 38.0, 7.0666667, 0.85),
        ("Sidama", 38.42, 6.69, 0.65),
        ("SWEP", 36.0, 6.5, 0.75),
    ]

    added = 0
    for name, lon, lat, r in placeholders:
        if name in existing:
            continue
        features.append(
            {
                "type": "Feature",
                "properties": {"name": name, "placeholder": True},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [circle_polygon(lon, lat, r_deg=r)],
                },
            }
        )
        added += 1

    geo_path.write_text(json.dumps(geo, ensure_ascii=False), encoding="utf-8")
    print(f"Added {added} placeholder feature(s). Total features: {len(features)}")


if __name__ == "__main__":
    main()

