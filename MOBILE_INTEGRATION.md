# Android App Integration Guide
Use this code to connect your Android App to the Backend Server.
Replace `YOUR_PC_IP` with the IP address shown in your terminal (e.g., `192.168.1.5`).

## 1. Add Dependencies (build.gradle :app)
```gradle
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
```

## 2. API Interface (ApiService.java)
```java
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface ApiService {
    @POST("/reports")
    Call<ReportResponse> submitReport(@Body ReportData report);
}
```

## 3. Data Models
**ReportData.java**
```java
public class ReportData {
    String userId;
    LocationData location;
    String type; // "Pothole"
    String severity; // "High", "Medium", "Low"
    String imageUrl; // Base64 string of the image
    String description;
    String source; // "Mobile App"

    public ReportData(String userId, double lat, double lng, String address, String severity, String imageUrl) {
        this.userId = userId;
        this.location = new LocationData(lat, lng, address);
        this.type = "Pothole";
        this.severity = severity;
        this.imageUrl = imageUrl;
        this.description = "Reported via mobile app";
        this.source = "Mobile App";
    }

    class LocationData {
        double lat;
        double lng;
        String address;
        LocationData(double lat, double lng, String address) {
            this.lat = lat; this.lng = lng; this.address = address;
        }
    }
}
```

**ReportResponse.java**
```java
public class ReportResponse {
    String message;
    String id;
}
```

## 4. Sending the Report (MainActivity.java or Helper)
Call this function when the pothole is detected.

```java
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public void sendToBackend(double lat, double lng, String address, String base64Image) {
    // 1. Setup Retrofit
    Retrofit retrofit = new Retrofit.Builder()
            .baseUrl("http://YOUR_PC_IP:3000/") // IMPORTANT: Use your PC's IP here, NOT localhost
            .addConverterFactory(GsonConverterFactory.create())
            .build();

    ApiService api = retrofit.create(ApiService.class);

    // 2. Prepare Data
    ReportData data = new ReportData("user-android", lat, lng, address, "High", base64Image);

    // 3. Make the Call
    api.submitReport(data).enqueue(new retrofit2.Callback<ReportResponse>() {
        @Override
        public void onResponse(retrofit2.Call<ReportResponse> call, retrofit2.Response<ReportResponse> response) {
            if (response.isSuccessful()) {
                System.out.println("Success! ID: " + response.body().id);
            } else {
                System.out.println("Server Error: " + response.code());
            }
        }

        @Override
        public void onFailure(retrofit2.Call<ReportResponse> call, Throwable t) {
            System.out.println("Network Error: " + t.getMessage());
        }
    });
}
```

## 5. Network Permission (AndroidManifest.xml)
Ensure you have this permission, and `android:usesCleartextTraffic="true"` in the `<application>` tag (since we are using http, not https).

```xml
<uses-permission android:name="android.permission.INTERNET" />

<application
    ...
    android:usesCleartextTraffic="true"
    ...>
```
