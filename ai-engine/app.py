from http.server import HTTPServer, SimpleHTTPRequestHandler

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        # 한글 출력을 위해 encode('utf-8') 사용
        self.wfile.write('AI Engine 정상 작동 중 (Python)'.encode('utf-8'))

PORT = 5000
print(f"Starting AI Engine on port {PORT}...")
httpd = HTTPServer(('0.0.0.0', PORT), CORSRequestHandler)
httpd.serve_forever()
