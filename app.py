import os
import json
from flask import Flask, render_template, jsonify, send_from_directory

# Initialize Flask app
app = Flask(__name__, 
            static_folder='.',
            static_url_path='',
            template_folder='.')

# Get port from environment variable or default to 5000
PORT = int(os.environ.get('PORT', 5000))
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'


# Load products data
def load_products():
    try:
        with open('data/products.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading products: {e}")
        return []


# ========== ROUTES ==========

@app.route('/')
def home():
    """Serve the home page"""
    return render_template('index.html')


@app.route('/pages/<page>')
def serve_page(page):
    """Serve dynamic pages"""
    valid_pages = ['about', 'cart', 'checkout', 'contact', 'shop']
    if page in valid_pages:
        return render_template(f'pages/{page}.html')
    return "Page not found", 404


# Static file routes
@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files"""
    return send_from_directory('css', filename)


@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files"""
    return send_from_directory('js', filename)


@app.route('/data/<path:filename>')
def serve_data(filename):
    """Serve data files"""
    return send_from_directory('data', filename)


@app.route('/api/products')
def api_products():
    """API endpoint for products"""
    products = load_products()
    return jsonify(products)


@app.route('/api/products/<int:product_id>')
def api_product_detail(product_id):
    """API endpoint for single product"""
    products = load_products()
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({'error': 'Product not found'}), 404


# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500


# Health check endpoint (useful for deployment)
@app.route('/health')
def health():
    """Health check for deployment"""
    return jsonify({'status': 'healthy'}), 200


if __name__ == '__main__':
    # Use environment variable for host (0.0.0.0 for deployment, localhost for local)
    host = os.environ.get('HOST', '127.0.0.1')
    
    print(f"🕐 TimeLess Server starting...")
    print(f"📍 Running on http://{host}:{PORT}")
    print(f"🔧 Debug mode: {DEBUG}")
    print(f"🌍 Press CTRL+C to stop\n")
    
    app.run(host=host, port=PORT, debug=DEBUG)
