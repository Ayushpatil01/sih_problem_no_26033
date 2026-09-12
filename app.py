import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from PIL import Image

app = Flask(__name__)
CORS(app)  # Allows your React frontend to communicate with Flask

# Set your API key directly or via environment variable
API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
client = genai.Client(api_key=API_KEY)

SYSTEM_PROMPT = """
You are an expert Indian Agricultural Officer and AGMARK Produce Quality Inspector.
Analyze the provided crop image strictly according to Indian AGMARK (Directorate of Marketing & Inspection - DMI) grading rules.

Return ONLY a valid JSON object matching this schema:
{
  "crop_name": "string",
  "grade": "Grade Extra Class / Grade 1 / Grade 2 / Reject",
  "quality_score_percent": 0-100,
  "defects_observed": ["list of defects"],
  "estimated_mandi_impact": "High Value / Standard Price / Discounted",
  "summary_marathi": "मराठीत शेतकऱ्यासाठी १-२ ओळीत सोपा सल्ला"
}
"""

@app.route('/api/grade-produce', methods=['POST'])
def grade_produce():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    img = Image.open(file.stream)

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[img, "Evaluate this produce based on AGMARK quality criteria."],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json"
        )
    )

    return response.text, 200, {'Content-Type': 'application/json'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)