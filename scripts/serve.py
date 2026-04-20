"""Local dev server for the static site."""

import http.server
import functools
import sys
from pathlib import Path


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    root = Path(__file__).resolve().parent.parent

    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
    server = http.server.HTTPServer(('0.0.0.0', port), handler)

    print(f'Serving at http://localhost:{port}')
    print('Press Ctrl+C to stop')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')


if __name__ == '__main__':
    main()
