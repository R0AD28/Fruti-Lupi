#include <WiFi.h>
#include <WebServer.h>

// Configuracion red WiFi
const char* ssid = "TuSSID";          // <-- Cambiar esto por tu red WiFi
const char* password = "clave1234";   // <-- Cambiar esto por tu contraseña

// Pines de botones físicos y frutas
const int buttonPins[] = {13, 14, 27, 32};  // Ajustar según los pines que se usen
const char* fruits[] = {"Naranja", "Sandia", "Uva", "Aguacate"};

bool lastStates[4] = {HIGH, HIGH, HIGH, HIGH};
String lastPressed = "Ninguno";
unsigned long lastSentTime = 0;


// Servidor web para visualizar botones
WebServer server(80);

// Página web de prueba (se puede sacar)
void handleRoot() {
  String html = R"rawliteral(
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Botón presionado</title>
      <style>
        body { font-family: sans-serif; text-align: center; margin-top: 50px; }
        h1 { color: #333; }
        h2 { color: green; }
      </style>
    </head>
    <body>
      <h1>Último botón presionado:</h1>
      <h2 id="estado">Cargando...</h2>
      <script>
        setInterval(() => {
          fetch("/estado")
            .then(response => response.text())
            .then(data => {
              document.getElementById("estado").textContent = data;
            });
        }, 500);
      </script>
    </body>
    </html>
  )rawliteral";

  server.send(200, "text/html", html);
}

// Ruta para que la interfaz obtenga la fruta presionada
void handleEstado() {
  server.sendHeader("Access-Control-Allow-Origin", "*"); // NECESARIO
  server.send(200, "text/plain", lastPressed);
}

void setup() {
  Serial.begin(115200);

  // Inicializa pines de botones con pull-up interno
  for (int i = 0; i < 4; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }

  // Conectar al WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConectado a WiFi.");
  Serial.print("Dirección IP del ESP32: ");
  Serial.println(WiFi.localIP());

  // Configura rutas del servidor
  server.on("/", handleRoot);         // Página de prueba (opcional)
  server.on("/estado", handleEstado); // Para que el navegador consulte

  server.begin();
  Serial.println("Servidor web iniciado.");
}

void loop() {
  server.handleClient();

  // Revisa cada botón
  for (int i = 0; i < 4; i++) {
    bool currentState = digitalRead(buttonPins[i]);

    if (lastStates[i] == HIGH && currentState == LOW) {
      lastPressed = fruits[i];
      Serial.println("Botón presionado: " + lastPressed);
      lastSentTime = millis();  // <-- Aquí se actualiza el tiempo del último botón
    }

    lastStates[i] = currentState;
  }

  // Restablecer el valor luego de 500ms
  if (lastPressed != "Ninguno" && millis() - lastSentTime > 500) {
    lastPressed = "Ninguno";
  }

  delay(50); // Antirrebote
}

