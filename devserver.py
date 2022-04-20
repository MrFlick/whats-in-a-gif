"""
This is a silly little script to spin up 
a dev webserver to test the pages properly.
This will just serve the .asp pages as plain
HTML pages.

Run with 

python devserver.py [port]
"""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

SimpleHTTPRequestHandler.extensions_map.update({
    ".asp": "text/html",
    ".js": "application/x-javascript"
    })

host = 'localhost'
port = 8080
if (len(sys.argv) == 2):
    port = int(sys.argv[1])
else:
    port = 8080

httpd = HTTPServer((host, port), SimpleHTTPRequestHandler)
print(f"Serving HTTP on {host} port {port} ")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nKeyboard interrupt received, exiting.")
    sys.exit(0)