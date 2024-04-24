from flask import Flask, render_template, request, jsonify
from chatbot import get_response
import json
app = Flask(__name__)
# Route for the home page
@app.route("/")
def index_get():
    return render_template("base.html")
# Route for the links page
@app.route("/links")
def links():
    return render_template("links.html")
# Load schemas from a JSON file
with open('schemas.json', 'r') as f:
    schemas = json.load(f)
# Function to get the next questions based on the response
def get_next_questions(response):
    for item in schemas["schemas"]:
        if "responses" in item and response in item["responses"]:
            return item.get("next_questions", [])
        elif "subcategories" in item:
            for subcategory in item["subcategories"]:
                if "responses" in subcategory and response in subcategory["responses"]:
                    return subcategory.get("next_questions", [])
    return []
# Route for handling predictions
@app.route("/predict", methods=["POST"])
def predict():
    text = request.get_json().get("message")
    response = get_response(text)
    # print(response)
    next_questions = get_next_questions(response)
    print(next_questions)
    message = {"answer": response, "next_questions": next_questions}
    return jsonify(message)

if __name__ == "__main__":
    app.run(debug=True)
