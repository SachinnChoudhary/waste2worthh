"""
Waste2Worth ML Model Trainer and Exporter
Extracts data generation, text classification, market valuation, and buyer recommendation
models from Waste2Worth_ML_Starter notebook and serializes artifacts for production serving.
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
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error

RANDOM_STATE = 42
random.seed(RANDOM_STATE)
np.random.seed(RANDOM_STATE)

# Directory setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# ---- 1. Waste Category Taxonomy ----
# category -> (hazard_level, base_price_per_kg_usd, co2_savings_per_kg_kg, typical descriptors)
CATEGORY_INFO = {
    "Metal Scrap":        ("Low",      0.35, 1.8, ["steel offcuts", "aluminum shavings", "scrap metal sheets", "copper wire ends", "iron filings"]),
    "Plastic Waste":      ("Low",      0.20, 1.2, ["HDPE offcuts", "PET bottle scrap", "plastic packaging waste", "polypropylene granules", "mixed plastic trims"]),
    "Textile Waste":      ("Low",      0.15, 0.9, ["fabric offcuts", "cotton scrap", "denim trimmings", "yarn waste", "dye-stained textile rolls"]),
    "Organic Waste":      ("Low",      0.05, 0.4, ["food processing residue", "fruit pulp waste", "vegetable trimmings", "spent grain", "agricultural byproduct"]),
    "Wood Waste":         ("Low",      0.10, 0.7, ["sawdust", "wood offcuts", "pallet scrap", "plywood trimmings", "timber shavings"]),
    "Chemical Residue":   ("High",     0.40, 2.1, ["solvent residue", "spent catalyst", "chemical sludge", "resin waste", "industrial coolant residue"]),
    "Construction Debris":("Medium",  0.08, 0.6, ["concrete rubble", "brick waste", "drywall offcuts", "tile fragments", "mixed construction debris"]),
    "E-Waste":            ("High",    0.60, 2.5, ["circuit board scrap", "cable waste", "used batteries", "electronic component offcuts", "damaged PCB units"]),
    "Paper & Cardboard":  ("Low",     0.12, 0.5, ["cardboard offcuts", "paper trimmings", "packaging paper waste", "corrugated scrap", "shredded paper waste"]),
    "Rubber Waste":       ("Medium",  0.18, 1.0, ["tire scrap", "rubber sheet offcuts", "conveyor belt waste", "rubber gasket trimmings", "vulcanized rubber scrap"]),
}

CONDITIONS = ["Clean / sorted", "Mixed / unsorted", "Contaminated", "Baled", "Loose"]
LOCATIONS = ["Delhi NCR", "Mumbai", "Pune", "Chennai", "Bengaluru", "Ahmedabad", "Hyderabad", "Kolkata"]

def make_description(category):
    _, _, _, descriptors = CATEGORY_INFO[category]
    desc = random.choice(descriptors)
    qty_word = random.choice(["large batch of", "regular supply of", "surplus of", "steady stream of", "one-time lot of"])
    return f"{qty_word} {desc} generated from our production line, available for pickup"

def generate_listings(n=1000):
    rows = []
    categories = list(CATEGORY_INFO.keys())
    for i in range(n):
        category = random.choice(categories)
        hazard, base_price, co2_factor, _ = CATEGORY_INFO[category]
        condition = random.choice(CONDITIONS)
        quantity_kg = round(float(np.random.gamma(shape=2.0, scale=800)), 1)
        location = random.choice(LOCATIONS)
        description = make_description(category)

        condition_multiplier = {
            "Clean / sorted": 1.15,
            "Baled": 1.05,
            "Mixed / unsorted": 0.85,
            "Loose": 0.95,
            "Contaminated": 0.55
        }.get(condition, 1.0)

        noise = float(np.random.normal(1.0, 0.1))
        price_per_kg = max(0.01, base_price * condition_multiplier * noise)
        market_value = round(price_per_kg * quantity_kg, 2)
        disposal_cost_saved = round(quantity_kg * 0.06, 2)
        co2_reduction_kg = round(quantity_kg * co2_factor * condition_multiplier, 1)

        rows.append({
            "listing_id": f"L{i:04d}",
            "description": description,
            "category": category,
            "hazard_level": hazard,
            "condition": condition,
            "quantity_kg": quantity_kg,
            "location": location,
            "price_per_kg": round(price_per_kg, 3),
            "market_value_usd": market_value,
            "disposal_cost_saved_usd": disposal_cost_saved,
            "co2_reduction_kg": co2_reduction_kg,
        })
    return pd.DataFrame(rows)

def train_and_export():
    print("1. Generating synthetic industrial waste dataset...")
    listings_df = generate_listings(n=1000)

    # ---- 2. Train Waste Classifier (TF-IDF + Logistic Regression) ----
    print("2. Training Waste Category Classifier...")
    X_train, X_test, y_train, y_test = train_test_split(
        listings_df["description"], listings_df["category"],
        test_size=0.2, random_state=RANDOM_STATE, stratify=listings_df["category"]
    )

    tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=2)
    X_train_vec = tfidf_vectorizer.fit_transform(X_train)
    X_test_vec = tfidf_vectorizer.transform(X_test)

    classifier = LogisticRegression(max_iter=1000, random_state=RANDOM_STATE)
    classifier.fit(X_train_vec, y_train)

    y_pred = classifier.predict(X_test_vec)
    print("Classification Report:")
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

    value_model = RandomForestRegressor(n_estimators=150, random_state=RANDOM_STATE)
    value_model.fit(Xr_train, yr_train)
    preds = value_model.predict(Xr_test)
    mae = mean_absolute_error(yr_test, preds)
    print(f"Valuation Regressor MAE: ${mae:.2f} USD")

    value_model_columns = features_df.columns.tolist()

    # ---- 4. Fit Buyer Recommendation TF-IDF Vectorizer ----
    print("4. Fitting Recommendation Vectorizer...")
    rec_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    rec_vectorizer.fit(listings_df["description"])

    # ---- 5. Export Model Artifacts ----
    print("5. Exporting model artifacts to:", MODELS_DIR)
    joblib.dump(tfidf_vectorizer, os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl"))
    joblib.dump(classifier, os.path.join(MODELS_DIR, "category_classifier.pkl"))
    joblib.dump(value_model, os.path.join(MODELS_DIR, "value_regressor.pkl"))
    joblib.dump(value_model_columns, os.path.join(MODELS_DIR, "value_model_columns.pkl"))
    joblib.dump(rec_vectorizer, os.path.join(MODELS_DIR, "recommendation_vectorizer.pkl"))
    joblib.dump(CATEGORY_INFO, os.path.join(MODELS_DIR, "category_info.pkl"))

    listings_df.to_csv(os.path.join(MODELS_DIR, "synthetic_listings.csv"), index=False)

    print("Successfully exported all models and dataset!")
    for item in sorted(os.listdir(MODELS_DIR)):
        print(f" - {item}")

if __name__ == "__main__":
    train_and_export()
