export const RED_STATION_WAITING_THRESHOLD = 20

export const getStationMarkerColor = (waitingPassengers) => {
  const count = Number(waitingPassengers) || 0

  if (count > RED_STATION_WAITING_THRESHOLD) return '#dc2626'
  if (count > 10) return '#f59e0b'
  return '#16a34a'
}

export const isRedStation = (station) => {
  return (Number(station?.waitingPassengers) || 0) > RED_STATION_WAITING_THRESHOLD
}

export const createRedStationNotification = (station) => ({
  id: `red-station-${station._id || station.stationId || station.name}`,
  station: station.name || 'Unknown station',
  message: 'Station marker is red on the map',
  people: Number(station.waitingPassengers) || 0,
  severity: 'high',
})
