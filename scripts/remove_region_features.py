import json
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    geo_path = root / "src" / "data" / "ethiopiaRegions.json"

    geo = json.loads(geo_path.read_text(encoding="utf-8"))
    features = geo.get("features", [])
    if not isinstance(features, list):
        raise SystemExit("Invalid GeoJSON: features is not a list")

    remove_ids = {"ET-CE", "ET-SW", "ET-SI"}
    remove_names = {"Central Ethiopia", "South West Ethiopia Peoples", "Sidama"}

    def should_remove(f: dict) -> bool:
        props = f.get("properties") or {}
        if not isinstance(props, dict):
            return False
        fid = str(props.get("id") or "").strip()
        name = str(props.get("name") or "").strip()
        return fid in remove_ids or name in remove_names

    before = len(features)
    kept = [f for f in features if not (isinstance(f, dict) and should_remove(f))]
    removed = before - len(kept)

    geo["features"] = kept
    geo_path.write_text(json.dumps(geo, ensure_ascii=False), encoding="utf-8")
    print(f"Removed {removed} feature(s). Total features: {len(kept)}")


if __name__ == "__main__":
    main()

