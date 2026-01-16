import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

const HeatmapLayer = ({ reports }) => {
    // A simple visual simulation of heatmap using large, semi-transparent circles
    return (
        <>
            {reports.map((report) => {
                const color =
                    report.severity === 'Critical' ? '#ef4444' :
                        report.severity === 'High' ? '#f97316' :
                            '#eab308'; // Red, Orange, Yellow

                return (
                    <CircleMarker
                        key={`heat-${report.id}`}
                        center={[report.location.lat, report.location.lng]}
                        radius={20}
                        pathOptions={{
                            color: color,
                            fillColor: color,
                            fillOpacity: 0.2,
                            stroke: false
                        }}
                    />
                )
            })}
        </>
    )
}

const ZoomHandler = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 13);
    }, [center, map]);
    return null;
}

export const MapComponent = ({ reports, center = [20.2961, 85.8245], zoom = 12 }) => {
    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 relative z-0">
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* "Heatmap" Effect Layer */}
                <HeatmapLayer reports={reports} />

                {/* Pins Layer */}
                {reports.map((report) => (
                    <Marker
                        key={report.id}
                        position={[report.location.lat, report.location.lng]}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-bold text-gray-900 mb-1">{report.type}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white
                        ${report.severity === 'Critical' ? 'bg-red-500' :
                                            report.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                                        {report.severity}
                                    </span>
                                    <span className="text-xs text-gray-500">{new Date(report.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                                {report.imageUrl && (
                                    <img src={report.imageUrl} alt="Report" className="w-full h-32 object-cover rounded-md" />
                                )}
                                <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Source: {report.source}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <ZoomHandler center={center} />

            </MapContainer>
        </div>
    );
};
