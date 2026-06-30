export const RED_STATION_WAITING_THRESHOLD = 9
export const YELLOW_STATION_WAITING_THRESHOLD = 5

export const getStationMarkerColor = (waitingPassengers) => {
  const count = Number(waitingPassengers) || 0

  // แดง: 9 คนขึ้นไป (9-12+)
  if (count >= RED_STATION_WAITING_THRESHOLD) return '#dc2626'
  
  // เหลือง: 5 ถึง 8 คน
  if (count >= YELLOW_STATION_WAITING_THRESHOLD) return '#ecc100'
  
  // เขียว: 0 ถึง 4 คน
  return '#16a34a'
}

export const isRedStation = (station) => {
  return (Number(station?.waitingPassengers) || 0) >= RED_STATION_WAITING_THRESHOLD
}

export const createRedStationNotification = (station) => ({
  id: `red-station-${station._id || station.stationId || station.name}`,
  station: station.name || 'Unknown station',
  message: 'Station marker is red on the map',
  people: Number(station.waitingPassengers) || 0,
  severity: 'high',
})