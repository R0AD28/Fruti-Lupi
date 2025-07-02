#include <WiFi.h>
#include <WebServer.h>

// Configuracion red WiFi
const char* ssid = "TuSSID";          // <-- Cambiar por tu red
const char* password = "Clave1234";   // <-- Cambiar por tu clave

// Pines de botones físicos y frutas
const int buttonPins[] = {13, 14, 27, 32};
const char* fruits[] = {"Naranja", "Sandia", "Uva", "Aguacate"};
bool lastStates[4] = {HIGH, HIGH, HIGH, HIGH};
String lastPressed = "Ninguno";
unsigned long lastSentTime = 0;

// Pines de LEDs
const int ledAcierto = 25; // LED verde
const int ledError = 26;   // LED rojo

WebServer server(80);

// Página de prueba (opcional)
void handleRoot() {
  String html = R"rawliteral(
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Botón presionado</title>
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

// Estado actual del botón
void handleEstado() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", lastPressed);
}

// Ruta para acierto
void handleAcierto() {
  digitalWrite(ledAcierto, HIGH);
  digitalWrite(ledError, LOW);
  delay(500);
  digitalWrite(ledAcierto, LOW);

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "OK");
}

// Ruta para error
void handleError() {
  digitalWrite(ledError, HIGH);
  digitalWrite(ledAcierto, LOW);
  delay(500);
  digitalWrite(ledError, LOW);

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "OK");
}

void setup() {
  Serial.begin(115200);

  for (int i = 0; i < 4; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }

  pinMode(ledAcierto, OUTPUT);
  pinMode(ledError, OUTPUT);
  digitalWrite(ledAcierto, LOW);
  digitalWrite(ledError, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConectado a WiFi.");
  Serial.print("Dirección IP del ESP32: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/estado", handleEstado);
  server.on("/acierto", handleAcierto);
  server.on("/error", handleError);
  server.begin();

  Serial.println("Servidor web iniciado.");
}

void loop() {
  server.handleClient();

  for (int i = 0; i < 4; i++) {
    bool currentState = digitalRead(buttonPins[i]);
    if (lastStates[i] == HIGH && currentState == LOW) {
      lastPressed = fruits[i];
      Serial.println("Botón presionado: " + lastPressed);
      lastSentTime = millis();
    }
    lastStates[i] = currentState;
  }

  if (lastPressed != "Ninguno" && millis() - lastSentTime > 500) {
    lastPressed = "Ninguno";
  }

  delay(50);
}
