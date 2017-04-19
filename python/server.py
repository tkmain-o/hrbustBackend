# import http.server
#import SocketServer
import mnist_prediction as mp
import image_filter as ifi
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
# from urlparse import urlparse, parse_qs
from cgi import parse_qs, escape, parse_header
# from urlparse import urlparse
# from wsgiref.simple_server import make_server
import test

# class Server(http.server)
# print("<<<")
# def predict(env, start_response):
#     print("predict")
#     start_response('201 OK', [('Content-Type', 'text/json')])
#
#     params = parse_qs(env['QUERY_STRING'])
#
#     file_path = params.get('name', [''])[0]
#     time = params.get('time', [''])[0]
#     test.t(file_path, int(time))
#
#     # ret = ifi.picture_loader(file_path)
#
#     # data = {
#     #     'digits': ret[0],
#     #     'predictable': ret[1]
#     # }
#     # print(params)
#     data = {
#         'digits': 'ret',
#         'predictable': True
#     }
#
#     return json.dumps(data)


# Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

# httpd = SocketServer.TCPServer(("", PORT), predict)
# httpd = make_server('', 8000, predict)
# # print "serving at port", PORT
# httpd.serve_forever()

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/json')
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        # params = parse_qs(self.path["QUERY_STRING"])
        print(parse_header(self.path))
        header = parse_header(self.path)[0]
        print(header)
        header = header[2:]
        params = parse_qs(header)
        print(params)
        if(len(params) is 0):
            print("gun")
        else:
            file_path = params['name'][0]
            print("file path: ", file_path)
            ret = ifi.picture_loader(file_path)
            digits = ""
            if (len(ret[0]) is 0):
                print ("unpredictable")
            # timeout = int(params['time'][0])
            # print(name, timeout)
            # te = test.Test(name, timeout)
            # te.t()
            # print(data)
            else:
                digits = mp.picture_prediction(ret[0])

            data = {
                    'digits': str.encode(str(digits)),
                    'predictable': ret[1]
            }

            print(data)
        xml = '<?xml version="1.0" encoding="UTF-8"?>' + "<note>" + "<digits>" + str(digits) + "</digits>" + "<predictable>" + str(ret[1]) + "</predictable>" + "</note>"
        # print(header)
        # print(params)
        # html = "<html><body><h1>" + str(digits) + "</h1></body></html>"
        self.wfile.write(str.encode(xml))
        # myen = json.dumps(data,
        #     sort_keys=True, indent=4)
        # self.wfile.write(myen)

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        # Doesn't do anything with posted data
        self._set_headers()
        self.wfile.write(b"<html><body><h1>POST!</h1></body></html>")

def run(server_class=HTTPServer, handler_class=S, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('Starting httpd...')
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
