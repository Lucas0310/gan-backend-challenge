const fs = require('fs/promises');

async function getAddresses() {
    const data = await fs.readFile('addresses.json', 'utf8')
    const addresses = JSON.parse(data)
    return addresses
}

function roundToDecimal(number, decimalPlaces) {
    const factor = 10 ** decimalPlaces;
    return Math.round(number * factor) / factor;
}

function haversineDistance(lat1, long1, lat2, long2) {
    const RADIUS = 6371
    const lat1Rad = degToRad(lat1);
    const long1Rad = degToRad(long1);
    const lat2Rad = degToRad(lat2);
    const long2Rad = degToRad(long2);

    const deltaLat = lat2Rad - lat1Rad;
    const deltaLong = long2Rad - long1Rad;

    const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLong / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = RADIUS * c;
    return distance;
}

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

module.exports = { getAddresses, roundToDecimal, haversineDistance }