"""
Waste2Worth ML Model Trainer and Exporter
Trains robust NLP classification, valuation regression, and buyer matching models
aligned with canonical Waste2Worth taxonomy:
1. Metal Scrap
2. Plastic Waste
3. Chemical Byproducts
4. Textile Waste
5. Wood & Paper
6. Glass
7. Electronic Waste
8. Organic Waste
9. Construction Debris
10. Rubber & Tires
"""

import os
import random
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error

RANDOM_STATE = 42
random.seed(RANDOM_STATE)
np.random.seed(RANDOM_STATE)

# Directory setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# ---- Canonical Category Taxonomy ----
# Category -> (default_hazard, base_price_usd_per_kg, co2_savings_kg_per_kg, keywords_and_materials)
CATEGORY_TAXONOMY = {
    "Metal Scrap": {
        "hazard": "Non-hazardous",
        "price_per_kg": 0.45,
        "co2_factor": 1.8,
        "items": [
            "steel mill slag", "blast furnace slag", "steel offcuts", "stainless steel 304 scrap",
            "stainless steel 316 sheet trimmings", "mild steel turning", "iron filings", "cast iron scrap",
            "copper wire scrap", "stripped copper cables", "brass fittings and turnings", "bronze shavings",
            "aluminum extrusion scrap", "aluminium beverage cans", "aluminum shavings and swarf",
            "zinc dross", "lead pipe scrap", "nickel alloy offcuts", "titanium scrap sheets",
            "tmt rebar end cuts", "crc metal sheets", "galvanized iron scrap", "industrial metal stampings",
            "automotive metal parts", "scrap metal pipes", "metal girder trimmings", "iron scrap", "steel",
            "aluminum", "copper", "brass", "metal swarf", "structural steel offcuts", "tinplate scraps",
            "scrap copper", "scrap iron", "scrap metal", "copper cables", "aluminum sheet", "metal wires"
        ]
    },
    "Plastic Waste": {
        "hazard": "Non-hazardous",
        "price_per_kg": 0.28,
        "co2_factor": 2.2,
        "items": [
            "hdpe drum regrind", "hdpe bottle scrap", "hdpe pipe cuttings", "pet bottle flakes",
            "pet bottle scrap", "recycled pet flakes", "polypropylene pp granules", "pp woven bags scrap",
            "ldpe film rolls", "lldpe stretch film scrap", "pvc pipe scrap", "rigid pvc offcuts",
            "abs plastic trimmings", "polystyrene ps foam scrap", "eps thermocol blocks", "polycarbonate sheets",
            "acrylic pmma sheet offcuts", "nylon 6 resin scrap", "plastic injection moulding waste",
            "blow moulding purge", "plastic crates and pallets", "polythene bags", "milk pouches",
            "multi-layer plastic waste", "packaging plastic film", "plastic regrind", "polymer scrap",
            "post-consumer plastic bottles", "plastic caps and closures", "recycled plastic granules",
            "plastic bottles", "plastic bottle", "pet bottles", "plastic scrap", "water bottles",
            "plastic containers", "plastic waste", "polyethylene scrap", "plastic drums", "shrink wrap film"
        ]
    },
    "Chemical Byproducts": {
        "hazard": "High",
        "price_per_kg": 0.35,
        "co2_factor": 1.5,
        "items": [
            "spent caustic soda naoh", "spent sulfuric acid", "hydrochloric acid hcl waste",
            "nitric acid effluent", "spent solvent ethanol methanol", "toluene and acetone mixture",
            "isopropyl alcohol ipa waste", "chemical sludge from etp", "effluent treatment plant sludge",
            "spent catalyst from refinery", "resin waste from polymer plant", "industrial paint sludge",
            "coolant and cutting oil residue", "distillation residue bottoms", "phosphating sludge",
            "electroplating bath residue", "organic solvent effluent", "petroleum refining sludge",
            "alkali wash solution", "waste motor oil", "used industrial lubricants", "spent pickle liquor",
            "toxic chemical residue", "hazardous chemical effluent", "acidic waste slurry", "chemical waste",
            "industrial acid", "waste solvents", "chemical byproducts"
        ]
    },
    "Textile Waste": {
        "hazard": "Non-hazardous",
        "price_per_kg": 0.20,
        "co2_factor": 3.8,
        "items": [
            "cotton selvedge", "cotton spinning mill waste", "cotton fabric offcuts", "denim fabric trimmings",
            "polyester fabric scrap", "garment cutting table waste", "yarn waste and thread cones",
            "dye-stained textile rolls", "knitted hosiery clips", "viscose rayon trimmings", "jute hessian waste",
            "silk scrap cuttings", "wool fabric rags", "nylon synthetic fabric trimmings", "textile lint and fluff",
            "tailoring fabric scraps", "apparel manufacturing cuttings", "cotton rags and wipes",
            "weaving mill waste", "unspun fiber trimmings", "textile dye waste", "textile waste",
            "fabric scrap", "cotton scrap", "denim waste", "cloth rags"
        ]
    },
    "Wood & Paper": {
        "hazard": "Non-hazardous",
        "price_per_kg": 0.14,
        "co2_factor": 0.9,
        "items": [
            "corrugated cardboard boxes", "kraft paper rolls", "cardboard packaging waste", "carton box offcuts",
            "shredded office paper", "paper mill broke waste", "old newspapers and magazines",
            "unprinted paper cuttings", "pulp residue", "sawdust from sawmill", "timber offcuts and logs",
            "wooden pallets scrap", "plywood sheets trimmings", "mdf particle board offcuts",
            "wood shavings and chips", "wooden shipping crates", "hardwood and softwood scrap",
            "reclaimed wood lumber", "wood bark byproduct", "recycled cardboard bales", "packaging paper scraps",
            "cardboard scrap", "waste paper", "wooden pallets", "wood scrap", "paper waste"
        ]
    },
    "Glass": {
        "hazard": "Non-hazardous",
        "price_per_kg": 0.10,
        "co2_factor": 0.7,
        "items": [
            "clear flint glass cullet", "broken glass bottles and jars", "amber beer bottle scrap",
            "green beverage glass shards", "flat window glass scrap", "float glass sheet offcuts",
            "laminated windshield glass fragments", "borosilicate laboratory glassware scrap",
            "crushed glass cullet", "container glass scrap", "architectural glass waste",
            "glass vial and ampoule scrap", "industrial glass trimmings", "silica glass cullet",
            "optical glass scrap", "hollow glass container cullet", "glass scrap", "glass cullet",
            "glass bottles", "broken glass", "window glass"
        ]
    },
    "Electronic Waste": {
        "hazard": "Moderate",
        "price_per_kg": 0.85,
        "co2_factor": 4.5,
        "items": [
            "printed circuit boards pcb scrap", "computer motherboards and green boards", "telecom server boards",
            "ram memory modules and cpu chips", "lithium ion battery packs", "dead li-ion 18650 cells",
            "laptop batteries and smartphone batteries", "lead acid inverter batteries", "copper wiring harness cables",
            "e-waste electrical scrap", "electronic component offcuts", "solder dross and flux residue",
            "broken smartphones and tablets", "discarded computer towers and monitors", "power supply smps units",
            "integrated circuits ic scrap", "capacitors and resistors waste", "electric motor scrap",
            "transformer copper coils", "electronic waste appliances", "crt monitor scrap", "bga chip scrap",
            "e-waste", "electronic waste", "old batteries", "pcb scrap", "circuit boards"
        ]
    },
    "Organic Waste": {
        "hazard": "Non-hazardous",
        "price_per_kg": 0.05,
        "co2_factor": 0.5,
        "items": [
            "spent grain from brewery", "sugarcane bagasse", "rice husk and paddy straw",
            "food processing vegetable peelings", "fruit pulp and citrus rind waste", "cafeteria organic food waste",
            "coffee grounds and tea waste", "spent mushroom substrate compost", "animal manure and poultry litter",
            "molasses press mud byproduct", "agricultural crop stalks", "coconut shell and coir pith",
            "biodegradable canteen food scrap", "oilseed cake meal", "abattoir organic byproduct",
            "wood chips compost", "bio-waste compost slurry", "fermentation biomass residue",
            "organic waste", "food waste", "crop waste", "brewery waste", "compost material"
        ]
    },
    "Construction Debris": {
        "hazard": "Low",
        "price_per_kg": 0.08,
        "co2_factor": 0.45,
        "items": [
            "concrete rubble and chunks", "crushed concrete aggregate", "broken red clay bricks",
            "drywall and gypsum plasterboard offcuts", "ceramic tile fragments and shards",
            "cured mortar and plaster debris", "fly ash class f", "bottom ash from thermal power plant",
            "granite slurry and marble dust", "excavated soil and gravel", "demolition masonry rubble",
            "asphalt road milling scrap", "red mud from bauxite refining", "cement bag waste and dust",
            "aggregate stone chips", "quarry dust and quarry tailings", "construction debris",
            "concrete waste", "brick rubble", "demolition waste", "fly ash"
        ]
    },
    "Rubber & Tires": {
        "hazard": "Low",
        "price_per_kg": 0.22,
        "co2_factor": 1.4,
        "items": [
            "used truck tires and car tyres", "scrap tyre casings", "crumb rubber granules",
            "tire retreading buffing dust", "rubber conveyor belt scrap", "rubber sheet offcuts",
            "vulcanized rubber trimmings", "butyl rubber inner tubes", "epdm rubber gaskets and seals",
            "automotive rubber hoses", "latex rubber scrap", "silicone rubber offcuts",
            "rubber o-rings and washers scrap", "reclaim rubber sheets", "shredded tire chips",
            "used tires", "used tyres", "rubber scrap", "tyre scrap", "scrap tires", "rubber waste"
        ]
    }
}

CONDITIONS = ["Clean / sorted", "Mixed / unsorted", "Contaminated", "Baled", "Loose"]
LOCATIONS = [
    "Jamshedpur Industrial Zone, Jharkhand",
    "Vadodara Petrochemical Hub, Gujarat",
    "Mathura Industrial Corridor, Uttar Pradesh",
    "Tirupur Textile Hub, Tamil Nadu",
    "Bhiwadi Industrial Area, Rajasthan",
    "Pune Auto Cluster, Maharashtra",
    "Sriperumbudur SEZ, Chennai",
    "Ankleshwar Chemical Zone, Gujarat",
    "Hyderabad Pharma City, Telangana",
    "Kolkata Port Logistics Hub, West Bengal"
]

PREFIXES = [
    "High-grade batch of",
    "Regular industrial supply of",
    "Surplus manufacturing lot of",
    "Bulk volume of",
    "Single-source sorted",
    "Post-production excess",
    "Continuous weekly supply of",
    "One-time decommissioning lot of",
    "Factory floor scrap consisting of",
    "Commercial recycling lot of",
    "High purity",
    "Clean industrial grade",
    "Unsorted batch of",
    "Baled and palletized"
]

SUFFIXES = [
    "generated from daily plant operations, ready for immediate dispatch.",
    "suitable for direct remelting, compounding, or energy recovery.",
    "available with full MSDS, lab test certificates, and transportation permits.",
    "packaged in heavy-duty jumbo bags / strapped pallets for safe loading.",
    "inspected and verified for low contamination and high reuse yield.",
    "consistent grade available on long-term supply contract."
]

def generate_synthetic_dataset(n_samples_per_category=400):
    rows = []
    listing_id = 1

    for category, meta in CATEGORY_TAXONOMY.items():
        items = meta["items"]
        hazard = meta["hazard"]
        base_price = meta["price_per_kg"]
        co2_factor = meta["co2_factor"]

        # Ensure direct single-keyword & short-phrase examples exist
        for item in items:
            rows.append({
                "listing_id": f"L{listing_id:05d}",
                "description": item,
                "category": category,
                "hazard_level": hazard,
                "condition": "Clean / sorted",
                "quantity_kg": 1000.0,
                "location": random.choice(LOCATIONS),
                "price_per_kg": base_price * 1.15,
                "market_value_usd": round(base_price * 1.15 * 1000, 2),
                "disposal_cost_saved_usd": round(1000 * 0.06, 2),
                "co2_reduction_kg": round(1000 * co2_factor * 1.15, 1)
            })
            listing_id += 1

        # Synthesize multi-sentence descriptive listings
        for _ in range(n_samples_per_category):
            item = random.choice(items)
            prefix = random.choice(PREFIXES)
            suffix = random.choice(SUFFIXES)
            condition = random.choice(CONDITIONS)
            location = random.choice(LOCATIONS)
            quantity_kg = round(float(np.random.gamma(shape=2.2, scale=1200)), 1)
            quantity_kg = max(50.0, quantity_kg)

            desc = f"{prefix} {item} {suffix}"

            condition_multiplier = {
                "Clean / sorted": 1.15,
                "Baled": 1.05,
                "Mixed / unsorted": 0.85,
                "Loose": 0.95,
                "Contaminated": 0.55
            }.get(condition, 1.0)

            # Hazard adjustment if description explicitly mentions chemicals/acids
            sample_hazard = hazard
            if "acid" in item or "solvent" in item or "chemical" in item or "toxic" in item:
                sample_hazard = "High" if condition == "Contaminated" else "Moderate"

            noise = float(np.random.normal(1.0, 0.08))
            price_per_kg = max(0.01, base_price * condition_multiplier * noise)
            market_value = round(price_per_kg * quantity_kg, 2)
            disposal_cost_saved = round(quantity_kg * 0.06, 2)
            co2_reduction_kg = round(quantity_kg * co2_factor * condition_multiplier, 1)

            rows.append({
                "listing_id": f"L{listing_id:05d}",
                "description": desc,
                "category": category,
                "hazard_level": sample_hazard,
                "condition": condition,
                "quantity_kg": quantity_kg,
                "location": location,
                "price_per_kg": round(price_per_kg, 3),
                "market_value_usd": market_value,
                "disposal_cost_saved_usd": disposal_cost_saved,
                "co2_reduction_kg": co2_reduction_kg,
            })
            listing_id += 1

    df = pd.DataFrame(rows)
    print(f"Generated {len(df)} total synthetic listings across {len(CATEGORY_TAXONOMY)} categories.")
    return df

def train_and_export():
    print("1. Generating comprehensive industrial waste dataset...")
    listings_df = generate_synthetic_dataset(n_samples_per_category=450)

    # ---- 2. Train Waste Classifier (TF-IDF + Calibrated Logistic Regression) ----
    print("2. Training Waste Category Classifier with sublinear TF-IDF and character/word n-grams...")
    X_train, X_test, y_train, y_test = train_test_split(
        listings_df["description"], listings_df["category"],
        test_size=0.2, random_state=RANDOM_STATE, stratify=listings_df["category"]
    )

    tfidf_vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),
        sublinear_tf=True,
        min_df=1,
        strip_accents='unicode',
        token_pattern=r'(?u)\b[a-zA-Z0-9_\-\/]{2,}\b'
    )
    X_train_vec = tfidf_vectorizer.fit_transform(X_train)
    X_test_vec = tfidf_vectorizer.transform(X_test)

    base_classifier = LogisticRegression(
        C=5.0,
        max_iter=2000,
        class_weight='balanced',
        random_state=RANDOM_STATE
    )
    base_classifier.fit(X_train_vec, y_train)

    y_pred = base_classifier.predict(X_test_vec)
    print("\n=== Classification Report ===")
    print(classification_report(y_test, y_pred))

    # ---- 3. Train Value Estimator (Random Forest Regressor) ----
    print("3. Training Market Valuation Regressor...")
    features_df = pd.get_dummies(
        listings_df[["category", "condition", "quantity_kg"]],
        columns=["category", "condition"]
    )
    target = listings_df["market_value_usd"]

    Xr_train, Xr_test, yr_train, yr_test = train_test_split(
        features_df, target, test_size=0.2, random_state=RANDOM_STATE
    )

    value_model = RandomForestRegressor(n_estimators=120, max_depth=16, random_state=RANDOM_STATE)
    value_model.fit(Xr_train, yr_train)
    preds = value_model.predict(Xr_test)
    mae = mean_absolute_error(yr_test, preds)
    print(f"Valuation Regressor MAE: ${mae:.2f} USD")

    value_model_columns = features_df.columns.tolist()

    # ---- 4. Fit Buyer Recommendation TF-IDF Vectorizer ----
    print("4. Fitting Buyer Recommendation Vectorizer...")
    rec_vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=1,
        strip_accents='unicode'
    )
    rec_vectorizer.fit(listings_df["description"])

    # ---- 5. Export Category Info Helper Mapping ----
    # category -> (hazard_level, base_price_usd, co2_factor, item_list)
    category_info_export = {
        k: (v["hazard"], v["price_per_kg"], v["co2_factor"], v["items"])
        for k, v in CATEGORY_TAXONOMY.items()
    }

    # ---- 6. Export Model Artifacts ----
    print("5. Exporting model artifacts to:", MODELS_DIR)
    joblib.dump(tfidf_vectorizer, os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl"))
    joblib.dump(base_classifier, os.path.join(MODELS_DIR, "category_classifier.pkl"))
    joblib.dump(value_model, os.path.join(MODELS_DIR, "value_regressor.pkl"))
    joblib.dump(value_model_columns, os.path.join(MODELS_DIR, "value_model_columns.pkl"))
    joblib.dump(rec_vectorizer, os.path.join(MODELS_DIR, "recommendation_vectorizer.pkl"))
    joblib.dump(category_info_export, os.path.join(MODELS_DIR, "category_info.pkl"))

    listings_df.to_csv(os.path.join(MODELS_DIR, "synthetic_listings.csv"), index=False)

    print("✅ Successfully exported all models and dataset!")
    for item in sorted(os.listdir(MODELS_DIR)):
        print(f" - {item}")

if __name__ == "__main__":
    train_and_export()
