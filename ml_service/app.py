"""
Waste2Worth Python ML Inference Microservice (Flask)
Provides real-time endpoints for waste classification, hazard detection,
market valuation estimation, ESG carbon savings, and buyer matching recommendations.
"""

import os
import re
import json
from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import joblib
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

app = Flask(__name__)

# Global model state
models = {}

# Canonical category mapping aliases
CATEGORY_ALIASES = {
    "chemical residue": "Chemical Byproducts",
    "e-waste": "Electronic Waste",
    "paper & cardboard": "Wood & Paper",
    "wood waste": "Wood & Paper",
    "rubber waste": "Rubber & Tires",
    "plastics & polymers": "Plastic Waste",
    "fly ash & slag": "Construction Debris",
    "e-waste & pcbs": "Electronic Waste",
    "wood & biomass": "Wood & Paper",
    "rubber & tyres": "Rubber & Tires",
}

# High-accuracy keyword lookup rules for fast, unambiguous resolution
KEYWORD_RULES = [
    (r"\b(hdpe|ldpe|lldpe|pet|pete|polypropylene|pp woven|pp granules|pvc|polyethylene|abs|polystyrene|thermocol|eps|polymer|plastic|polythene|acrylic|nylon|regrind|plastic bottles?|pet bottles?|water bottles?)\b", "Plastic Waste", "Non-hazardous"),
    (r"\b(flint glass|borosilicate|windshield|vial|ampoule|bottle glass|glass cullet|cullet|crushed glass|glass shards?|glass scrap|glass bottles?|glass)\b", "Glass", "Non-hazardous"),
    (r"\b(pcb|printed circuit|motherboard|cpu|ram module|semiconductor|lithium|li-ion|battery|batteries|e-waste|electronic|capacitors?|smps|microchip|circuit board|server board|inverter battery)\b", "Electronic Waste", "Moderate"),
    (r"\b(acid|solvent|caustic|naoh|hcl|sludge|effluent|etp|coolant|distillation|phosphating|petroleum sludge|spent catalyst|resin waste|chemical|pickle liquor|lubricant oil|chemical effluent|toxic)\b", "Chemical Byproducts", "High"),
    (r"\b(tyres?|tires?|rubber|epdm|vulcanized|crumb rubber|butyl|inner tube|gasket|conveyor belt|retread)\b", "Rubber & Tires", "Low"),
    (r"\b(cardboard|carton|kraft|paper|newsprint|pulp|sawdust|timber|pallets?|plywood|mdf|wood|lumber|shavings|woodchips?|box scrap)\b", "Wood & Paper", "Non-hazardous"),
    (r"\b(cotton|denim|fabric|yarn|textile|garment|hosiery|viscose|rayon|silk|wool|cloth|selvedge|rags?|apparel scrap)\b", "Textile Waste", "Non-hazardous"),
    (r"\b(bagasse|husk|food waste|vegetable|fruit pulp|compost|manure|spent grain|crop|paddy|brewery|organic|bio-?waste|peelings?)\b", "Organic Waste", "Non-hazardous"),
    (r"\b(concrete|brick|mortar|drywall|gypsum|plaster|fly ash|bottom ash|granite|marble|demolition|rubble|asphalt|stone chips|cement|aggregate)\b", "Construction Debris", "Low"),
    (r"\b(steel|iron|copper|aluminum|aluminium|brass|bronze|zinc|lead|nickel|titanium|metal|slag|dross|swarf|turnings?|filings?|rebar|tinplate|pipes?|wire scrap|sheet scrap|cables?)\b", "Metal Scrap", "Non-hazardous"),
]

def load_models():
    """Loads pre-trained model artifacts into memory."""
    try:
        models["tfidf_vectorizer"] = joblib.load(os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl"))
        models["category_classifier"] = joblib.load(os.path.join(MODELS_DIR, "category_classifier.pkl"))
        models["value_regressor"] = joblib.load(os.path.join(MODELS_DIR, "value_regressor.pkl"))
        models["value_model_columns"] = joblib.load(os.path.join(MODELS_DIR, "value_model_columns.pkl"))
        models["recommendation_vectorizer"] = joblib.load(os.path.join(MODELS_DIR, "recommendation_vectorizer.pkl"))
        models["category_info"] = joblib.load(os.path.join(MODELS_DIR, "category_info.pkl"))
        
        csv_path = os.path.join(MODELS_DIR, "synthetic_listings.csv")
        if os.path.exists(csv_path):
            models["listings_df"] = pd.read_csv(csv_path)
            # Precompute TF-IDF matrix for existing listings
            models["listing_vectors"] = models["recommendation_vectorizer"].transform(
                models["listings_df"]["description"].fillna("")
            )
        print("✅ All Waste2Worth ML models loaded successfully.")
    except Exception as e:
        print(f"⚠️ Warning: Could not load some models ({e}). Retraining may be needed.")

# Load models on startup
load_models()

# Native CORS handler
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    return response

# Root & CORS handlers
@app.route("/", methods=["GET"])
def root_index():
    return jsonify({
        "status": "online",
        "service": "Waste2Worth Python ML Inference Microservice",
        "version": "2.0.0",
        "models_loaded": len(models) >= 5,
        "endpoints": [
            {"method": "GET", "path": "/health", "desc": "Service health and loaded models"},
            {"method": "POST", "path": "/api/ml/predict-category", "desc": "Classify waste & hazard from description"},
            {"method": "POST", "path": "/api/ml/estimate-value", "desc": "Estimate market value & ESG carbon metrics"},
            {"method": "POST", "path": "/api/ml/classify-and-value", "desc": "Combined single-call classification + valuation"},
            {"method": "POST", "path": "/api/ml/recommend-buyers", "desc": "Match buyer interests to listings (TF-IDF Cosine Sim)"}
        ]
    })

@app.route("/favicon.ico", methods=["GET"])
@app.route("/.well-known/<path:dummy>", methods=["GET"])
def devtools_and_favicon(dummy=None):
    return "", 204

@app.route("/", methods=["OPTIONS"])
@app.route("/<path:dummy>", methods=["OPTIONS"])
def options_handler(dummy=None):
    return "", 204

@app.errorhandler(404)
def handle_404(e):
    return jsonify({"status": "error", "message": "Endpoint not found", "root": "/"}), 404

@app.errorhandler(405)
def handle_405(e):
    return jsonify({"status": "error", "message": "Method not allowed for requested route"}), 405

# ---- Helper Functions ----

def normalize_category(category: str) -> str:
    """Normalizes any category string or legacy alias to canonical Waste2Worth taxonomy."""
    if not category:
        return "Metal Scrap"
    cleaned = category.strip()
    lowered = cleaned.lower()
    return CATEGORY_ALIASES.get(lowered, cleaned)

def classify_text_hybrid(text: str):
    """
    Hybrid classification engine:
    1. Evaluates direct domain-specific keyword / material indicators
    2. Runs TF-IDF + Calibrated Logistic Regression model
    3. Blends keyword evidence and statistical distribution for maximum precision
    """
    norm_text = text.lower()
    matched_keyword_cat = None
    matched_hazard = None

    for pattern, cat, haz in KEYWORD_RULES:
        if re.search(pattern, norm_text, re.IGNORECASE):
            matched_keyword_cat = cat
            matched_hazard = haz
            break

    # Statistical ML prediction
    ml_category = None
    ml_confidence = 0.50

    if "category_classifier" in models and "tfidf_vectorizer" in models:
        try:
            vec = models["tfidf_vectorizer"].transform([text])
            ml_category = models["category_classifier"].predict(vec)[0]
            ml_category = normalize_category(ml_category)
            probs = models["category_classifier"].predict_proba(vec)[0]
            ml_confidence = float(np.max(probs))
        except Exception as e:
            print(f"Error during ML inference: {e}")

    # Decision fusion
    if matched_keyword_cat:
        if ml_category and ml_category == matched_keyword_cat:
            final_cat = matched_keyword_cat
            confidence = max(0.92, ml_confidence)
        else:
            # If keyword matched strongly but text is short or sparse, trust keyword
            final_cat = matched_keyword_cat
            confidence = 0.90 if len(text.split()) <= 4 else max(0.85, ml_confidence)
    elif ml_category:
        final_cat = ml_category
        confidence = ml_confidence
    else:
        final_cat = "Metal Scrap"
        confidence = 0.50

    # Hazard determination
    cat_info = models.get("category_info", {})
    if matched_hazard:
        hazard_level = matched_hazard
    elif final_cat in cat_info:
        hazard_level = cat_info[final_cat][0]
    else:
        hazard_level = "Non-hazardous"

    # Contextual hazard boosts
    if any(w in norm_text for w in ["toxic", "hazard", "acid", "corrosive", "flammable", "lead acid", "cyanide", "cadmium"]):
        hazard_level = "High"

    return final_cat, hazard_level, round(confidence, 3)

def rule_based_valuation(category: str, condition: str, quantity_kg: float):
    norm_cat = normalize_category(category)
    cat_info = models.get("category_info", {})
    if norm_cat not in cat_info:
        base_price, co2_factor = 0.25, 1.2
    else:
        _, base_price, co2_factor, _ = cat_info[norm_cat]

    condition_multiplier = {
        "Clean / sorted": 1.15,
        "Baled": 1.05,
        "Mixed / unsorted": 0.85,
        "Loose": 0.95,
        "Contaminated": 0.55,
    }.get(condition, 1.0)

    price_per_kg = base_price * condition_multiplier
    market_value = round(price_per_kg * quantity_kg, 2)
    disposal_cost_saved = round(quantity_kg * 0.06, 2)
    co2_reduction_kg = round(quantity_kg * co2_factor * condition_multiplier, 1)

    return {
        "estimated_value_usd": max(1.0, market_value),
        "disposal_cost_saved_usd": disposal_cost_saved,
        "co2_reduction_kg": co2_reduction_kg,
    }

def ml_valuation(category: str, condition: str, quantity_kg: float):
    norm_cat = normalize_category(category)
    cols = models.get("value_model_columns")
    regressor = models.get("value_regressor")
    
    if not cols or not regressor:
        return rule_based_valuation(norm_cat, condition, quantity_kg)

    row = {col: 0 for col in cols}
    row["quantity_kg"] = quantity_kg
    cat_col = f"category_{norm_cat}"
    cond_col = f"condition_{condition}"
    if cat_col in row:
        row[cat_col] = 1
    if cond_col in row:
        row[cond_col] = 1

    try:
        df_input = pd.DataFrame([row])[cols]
        pred_val = float(regressor.predict(df_input)[0])
    except Exception:
        pred_val = rule_based_valuation(norm_cat, condition, quantity_kg)["estimated_value_usd"]

    rule_extra = rule_based_valuation(norm_cat, condition, quantity_kg)

    return {
        "estimated_value_usd": max(1.0, round(pred_val, 2)),
        "disposal_cost_saved_usd": rule_extra["disposal_cost_saved_usd"],
        "co2_reduction_kg": rule_extra["co2_reduction_kg"],
    }

# ---- API Endpoints ----

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Waste2Worth ML Engine",
        "version": "2.0.0",
        "models_loaded": len(models) >= 5,
        "loaded_keys": list(models.keys())
    })

@app.route("/api/ml/predict-category", methods=["GET", "POST"])
def predict_category():
    if request.method == "GET":
        description = request.args.get("description", "Clean HDPE plastic regrind flakes from chemical drums").strip()
    else:
        data = request.get_json(silent=True) or {}
        description = data.get("description", "").strip()

    if not description:
        return jsonify({"error": "Field 'description' is required. Provide via JSON body or ?description=... query param"}), 400

    category, hazard_level, confidence = classify_text_hybrid(description)

    return jsonify({
        "input_description": description,
        "category": category,
        "hazard_level": hazard_level,
        "confidence": confidence,
    })

@app.route("/api/ml/estimate-value", methods=["GET", "POST"])
def estimate_value():
    if request.method == "GET":
        category = normalize_category(request.args.get("category", "Metal Scrap"))
        condition = request.args.get("condition", "Clean / sorted")
        quantity_kg = float(request.args.get("quantity_kg", 1000))
        use_ml_valuation = request.args.get("use_ml_valuation", "true").lower() != "false"
    else:
        data = request.get_json(silent=True) or {}
        category = normalize_category(data.get("category", "Metal Scrap"))
        condition = data.get("condition", "Clean / sorted")
        try:
            quantity_kg = float(data.get("quantity_kg", 1000))
        except (ValueError, TypeError):
            quantity_kg = 1000.0
        use_ml_valuation = data.get("use_ml_valuation", True)

    if use_ml_valuation and "value_regressor" in models:
        val = ml_valuation(category, condition, quantity_kg)
        mode = "Random Forest Regressor (ML)"
    else:
        val = rule_based_valuation(category, condition, quantity_kg)
        mode = "Rule-based Taxonomy & Factor Tables"

    return jsonify({
        "category": category,
        "condition": condition,
        "quantity_kg": quantity_kg,
        "estimated_value_usd": val["estimated_value_usd"],
        "disposal_cost_saved_usd": val["disposal_cost_saved_usd"],
        "co2_reduction_kg": val["co2_reduction_kg"],
        "pricing_model": mode,
    })

@app.route("/api/ml/classify-and-value", methods=["GET", "POST"])
def classify_and_value():
    if request.method == "GET":
        description = request.args.get("description", "High-calcium steel slag from blast furnace operations").strip()
        condition = request.args.get("condition", "Clean / sorted")
        quantity_kg = float(request.args.get("quantity_kg", 1000))
        use_ml_valuation = request.args.get("use_ml_valuation", "true").lower() != "false"
    else:
        data = request.get_json(silent=True) or {}
        description = data.get("description", "").strip()
        condition = data.get("condition", "Clean / sorted")
        try:
            quantity_kg = float(data.get("quantity_kg", 500))
        except (ValueError, TypeError):
            quantity_kg = 500.0
        use_ml_valuation = data.get("use_ml_valuation", True)

    # 1. Classification
    category, hazard_level, confidence = classify_text_hybrid(description)

    # 2. Valuation & Impact
    if use_ml_valuation and "value_regressor" in models:
        val = ml_valuation(category, condition, quantity_kg)
        mode = "Random Forest ML"
    else:
        val = rule_based_valuation(category, condition, quantity_kg)
        mode = "Rule-based Baseline"

    return jsonify({
        "description": description,
        "category": category,
        "hazard_level": hazard_level,
        "classification_confidence": confidence,
        "estimated_value_usd": val["estimated_value_usd"],
        "disposal_cost_saved_usd": val["disposal_cost_saved_usd"],
        "co2_reduction_kg": val["co2_reduction_kg"],
        "pricing_model": mode,
    })

@app.route("/api/ml/recommend-buyers", methods=["GET", "POST"])
def recommend_buyers():
    if request.method == "GET":
        buyer_interests = request.args.get("buyer_interests", "Clean HDPE plastic regrind flakes and polymer offcuts").strip()
        top_n = min(50, max(1, int(request.args.get("top_n", 5))))
    else:
        data = request.get_json(silent=True) or {}
        buyer_interests = data.get("buyer_interests", "").strip()
        top_n = min(50, max(1, int(data.get("top_n", 5))))

    if not buyer_interests:
        return jsonify({"error": "Field 'buyer_interests' is required. Provide via JSON body or ?buyer_interests=... query param"}), 400

    if "recommendation_vectorizer" not in models or "listings_df" not in models:
        return jsonify({"error": "Recommendation engine not initialized"}), 503

    rec_vec = models["recommendation_vectorizer"]
    listings_df = models["listings_df"]
    listing_vectors = models["listing_vectors"]

    buyer_vec = rec_vec.transform([buyer_interests])
    similarities = cosine_similarity(buyer_vec, listing_vectors).flatten()

    top_idx = similarities.argsort()[::-1][:top_n]
    matches = []

    for idx in top_idx:
        row = listings_df.iloc[idx]
        matches.append({
            "listing_id": str(row["listing_id"]),
            "category": str(row["category"]),
            "description": str(row["description"]),
            "market_value_usd": float(row["market_value_usd"]),
            "match_score": round(float(similarities[idx]), 3),
        })

    return jsonify({
        "query": buyer_interests,
        "count": len(matches),
        "matches": matches,
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
