const { parentPort, workerData } = require('worker_threads')
const utils = require('./utils')

const getCitiesWithinRadius = async (params) => {
    const { from, distance } = params
    const addresses = await utils.getAddresses()
    const queryCity = addresses.find(address => address.guid == from)

    const addressesToEvaluate = addresses.filter(address => address.guid !== queryCity.guid)
    const citiesWithinRadius = []

    for (const address of addressesToEvaluate) {
        const distanceFromCity = utils.haversineDistance(queryCity.latitude, queryCity.longitude, address.latitude, address.longitude)
        const roundedDistanceFromCity = utils.roundToDecimal(distanceFromCity, 2)

        if (roundedDistanceFromCity <= parseInt(distance)) {
            citiesWithinRadius.push(address)
        }
    }

    return citiesWithinRadius
}

// Execute the function and send the result back to the main thread
try {
    (async () => {
        const result = await getCitiesWithinRadius(workerData)

        parentPort.postMessage({ status: 'completed', result })
    })()
}
catch (error) {
    console.log(error)
}