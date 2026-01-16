#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ArduinoJson.h>

#define VIB_PIN 34

Adafruit_MPU6050 mpu;
WebServer server(80);

// -------- WiFi AP --------
const char* ssid = "POTHOLE_ESP32";
const char* password = "12345678";

// -------- Event Storage (last 10 potholes) --------
struct Event {
  unsigned long time_s;  // timestamp in seconds since boot
  float minZ;            // peak dip
};

Event events[10];
int eventIndex = 0;       // next slot in circular buffer
int eventCount = 0;       // total number stored (max 10)
bool potholeDetected = false;

// -------- Detection Vars --------
float prevZ = 0;
unsigned long eventStart = 0;
bool inEvent = false;
float minZ = 0;
float maxZ = 0;

// -------- Thresholds --------
#define Z_DIP_THRESHOLD   -12.0   // trigger only for bigger dips
#define MAX_EVENT_TIME    200     // max duration in ms to ignore speed breakers
#define SLOPE_THRESHOLD   2.0     // require sharp slope
#define MIN_EVENT_DURATION 20     // min duration in ms

void setup() {
  Serial.begin(115200);
  pinMode(VIB_PIN, INPUT);

  Wire.begin();
  if (!mpu.begin()) {
    Serial.println("MPU6050 not found!");
    while (1);
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  WiFi.softAP(ssid, password);
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.softAPIP());

  server.on("/status", handleStatus);
  server.on("/events", handleEvents);
  server.begin();
  Serial.println("Web server started");
}

void loop() {
  server.handleClient();
  detectPothole();
}

// ------------------ POTHOLE DETECTION ------------------
void detectPothole() {
  sensors_event_t a, g, t;
  mpu.getEvent(&a, &g, &t);

  float z = a.acceleration.z - 9.81;  // remove gravity
  float deltaZ = z - prevZ;
  int vibration = digitalRead(VIB_PIN);
  unsigned long now = millis();

  // Start event if dip exceeds threshold
  if (!inEvent && z < Z_DIP_THRESHOLD) {
    inEvent = true;
    eventStart = now;
    minZ = z;
    maxZ = z;
  }

  if (inEvent) {
    minZ = min(minZ, z);
    maxZ = max(maxZ, z);

    unsigned long duration = now - eventStart;

    // Reject if event lasts too long → likely speed breaker
    if (duration > MAX_EVENT_TIME) {
      inEvent = false;
    }

    // Trigger pothole if sharp slope + vibration + duration >= MIN_EVENT_DURATION
    if (abs(deltaZ) > SLOPE_THRESHOLD && vibration == HIGH && duration >= MIN_EVENT_DURATION) {
      // Only store if dip is large enough
      if (minZ <= Z_DIP_THRESHOLD) {
        registerPothole(minZ, duration);
      }
      inEvent = false;
    }
  }

  prevZ = z;
}

// ------------------ REGISTER EVENT ------------------
void registerPothole(float dip, unsigned long duration) {
  potholeDetected = true;

  events[eventIndex] = {
    millis() / 1000,  // seconds since boot
    dip
  };

  eventIndex = (eventIndex + 1) % 10;  // circular buffer
  if (eventCount < 10) eventCount++;

  Serial.print("🚨 POTHOLE DETECTED | Dip: ");
  Serial.print(dip);
  Serial.print(" | Duration(ms): ");
  Serial.println(duration);
}

// ------------------ API HANDLERS ------------------
void handleStatus() {
  StaticJsonDocument<200> doc;
  doc["pothole"] = potholeDetected;
  doc["uptime_s"] = millis() / 1000;

  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);

  potholeDetected = false;
}

void handleEvents() {
  StaticJsonDocument<1024> doc;
  doc["device"] = "ESP32-Pothole-Node";
  doc["count"] = eventCount;

  JsonArray arr = doc.createNestedArray("events");

  for (int i = 0; i < eventCount; i++) {
    int idx = (eventIndex - eventCount + i + 10) % 10; // circular buffer indexing
    JsonObject e = arr.createNestedObject();
    e["time_s"] = events[idx].time_s;
    e["dip"] = events[idx].minZ;
  }
  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);
}
