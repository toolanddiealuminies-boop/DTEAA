import json

with open("C:/Users/MuraliM/.gemini/antigravity/brain/cb56279e-c6a0-4f88-ba0d-18b25d092aba/.system_generated/steps/234/output.txt", "r", encoding="utf-8") as f:
    schema1 = json.load(f)["tables"]
with open("C:/Users/MuraliM/.gemini/antigravity/brain/cb56279e-c6a0-4f88-ba0d-18b25d092aba/.system_generated/steps/235/output.txt", "r", encoding="utf-8") as f:
    schema2 = json.load(f)["tables"]

d1 = {t["name"]: t for t in schema1}
d2 = {t["name"]: t for t in schema2}

print("=== TABLE DIFFERENCES ===")
diff1 = set(d1.keys()) - set(d2.keys())
print("Tables in DTEAA not in muralineo:", diff1 if diff1 else "None")
diff2 = set(d2.keys()) - set(d1.keys())
print("Tables in muralineo not in DTEAA:", diff2 if diff2 else "None")

print("\n=== COLUMN DIFFERENCES IN COMMON TABLES ===")
for t in set(d1.keys()) & set(d2.keys()):
    c1 = {c["name"]: c for c in d1[t]["columns"]}
    c2 = {c["name"]: c for c in d2[t]["columns"]}
    missing_in_2 = set(c1.keys()) - set(c2.keys())
    missing_in_1 = set(c2.keys()) - set(c1.keys())
    if missing_in_2 or missing_in_1:
        print(f"Table {t}:")
        if missing_in_2: print(f"  Missing in muralineo: {missing_in_2}")
        if missing_in_1: print(f"  Missing in DTEAA: {missing_in_1}")
        
    for col in set(c1.keys()) & set(c2.keys()):
        if c1[col].get("data_type") != c2[col].get("data_type"):
            print(f"  Table {t} Column {col} Type mismatch: DTEAA={c1[col].get('data_type')} vs muralineo={c2[col].get('data_type')}")

print("\n=== FOREIGN KEY DIFFERENCES IN COMMON TABLES ===")
for t in set(d1.keys()) & set(d2.keys()):
    f1 = {f["name"] for f in d1[t].get("foreign_key_constraints", [])}
    f2 = {f["name"] for f in d2[t].get("foreign_key_constraints", [])}
    if f1 != f2:
        print(f"Table {t}:")
        if f1 - f2: print(f"  FKs only in DTEAA: {f1 - f2}")
        if f2 - f1: print(f"  FKs only in muralineo: {f2 - f1}")
