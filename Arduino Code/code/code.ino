#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "BluetoothSerial.h"

Adafruit_MPU6050 mpu;
BluetoothSerial SerialBT;

#define SW420_PIN 34
#define DIP_THRESHOLD 12.0      // Tune this
#define DEBOUNCE_MS 500

unsigned long lastTriggerTime = 0;

void setup() {
  Serial.begin(115200);

  Wire.begin(21, 22);

  if (!mpu.begin()) {
    Serial.println("MPU6050 not found");
    while (1);
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  pinMode(SW420_PIN, INPUT);

  SerialBT.begin("ESP32_POTHOLE");

  Serial.println("Bluetooth Classic Server Ready");
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  float az = a.acceleration.z;
  float dip = az - 9.81;      // Gravity compensated dip

  bool vibration = digitalRead(SW420_PIN);

  if (abs(dip) > DIP_THRESHOLD &&
      vibration &&
      (millis() - lastTriggerTime > DEBOUNCE_MS)) {

    lastTriggerTime = millis();

    float time_s = millis() / 1000.0;

    // Optimized JSON payload
    char payload[64];
    snprintf(payload, sizeof(payload),
             "{\"dip\":%.2f,\"time_s\":%.2f}",
             dip, time_s);

    Serial.println(payload);
    SerialBT.println(payload);
  }

  delay(20);
}