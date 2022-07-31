from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
	return render_template("cardtest.html")

@app.route("/test-sprite")
def test_sprite():
	return render_template("test-sprite.html")