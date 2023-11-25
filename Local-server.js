const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: '123456'
};

const app = express();
const IP = "192.168.1.144"
const PORT = 8000;

// Configurar middleware para analizar solicitudes JSON
app.use(bodyParser.json());

// Datos iniciales (esto es solo un ejemplo)

let datos = {}
let users = []

const server = https.createServer(options, (req, res) => {
  // Configurar encabezados CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://turbowarp.org');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar la solicitud de la raíz ("/")
  if (req.url === '/' || req.url === '') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Hello World!");
    console.log("Hello World!")
  } else if (req.url.startsWith('/api/data')) {
    if (req.method === 'GET') {
      res.end(JSON.stringify(datos));
      console.log(datos)
    } else if (req.method === 'POST') {
      let body = "";
      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        console.log(body)
        try {
          const parsedBody = JSON.parse(body);
          const [clave, valor] = Object.entries(parsedBody)[0];

          console.log(valor)

          const idx = users.indexOf(clave)

          if (valor=="") {
            delete datos[clave]
            users.splice(idx, 1)
            console.log("deleted")
            console.log(datos)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(datos));
            return;
          }

          
          datos[clave] = valor;
          

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(datos));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(error));
        }
      });
    } else {
			res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Método no permitido');
		}
  } else if (req.url.startsWith('/api/users')) {
    if (req.method === 'GET') {
      res.end(JSON.stringify(users));
      console.log(users)
    }
  } else {
    // Enviar una respuesta 404 para cualquier otra solicitud
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página no encontrada');
  }
});

server.listen(PORT, IP, () => {
  console.log(`Servidor corriendo en https://${IP}:${PORT}/`);
});
