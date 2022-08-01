from random_pokemon import get_draft
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
	return render_template("index.html")

@app.route("/draft")
def draft():
	return render_template("draft.html", draft=get_draft())