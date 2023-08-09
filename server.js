const express = require('express')
const utils = require('./utils')
const verifyToken = require('./middlewares')
const { Worker } = require('worker_threads')
const fs = require('fs')
const app = express()
const PORT = 8080
const PROTOCOL = 'http'
const HOST = '127.0.0.1'

const tasks = {}

app.use(verifyToken)

app.get('/cities-by-tag', async (req, res) => {
    const { tag, isActive } = req.query

    try {
        const addresses = await utils.getAddresses()
        const filteredAddresses = addresses.filter(address =>
            address.isActive == !!isActive &&
            address.tags.includes(tag))

        res.status(200).json({ cities: filteredAddresses })
    } catch (err) {
        console.log(err)
        res.status(500)
    }
})


app.get('/distance', async (req, res) => {
    const { to, from } = req.query
    const guids = [to, from]

    const addresses = await utils.getAddresses()
    const filteredaddresses = addresses.filter(address => guids.includes(address.guid))

    const { latitude: lat1, longitude: long1 } = filteredaddresses[0]
    const { latitude: lat2, longitude: long2 } = filteredaddresses[1]
    const distance = utils.roundToDecimal(utils.haversineDistance(lat1, long1, lat2, long2), 2)

    const response = { from: { guid: from }, to: { guid: to }, unit: 'km', distance }
    res.status(200).json(response)
})

app.get('/area', async (req, res) => {
    const { from, distance } = req.query

    const worker = new Worker('./worker.js', {
        workerData: { from, distance }
    })

    const taskId = '2152f96f-50c7-4d76-9e18-f7033bd14428'
    tasks[taskId] = { status: 'pending' }

    worker.on('message', message => {
        tasks[taskId] = message
    })

    worker.on('error', error => {
        console.error('Worker error:', error)
        tasks[taskId] = { status: 'error', result: error }
    })

    worker.on('exit', code => {
        console.log('Worker exited with code:', code)
    })

    const resultsUrl = `${PROTOCOL}://${HOST}:${PORT}/area-result/${taskId}`
    res.status(202).json({ resultsUrl })
})

app.get('/area-result/:id', (req, res) => {
    const { id } = req.params

    const taskInfo = tasks[id]

    if (taskInfo) {
        if (taskInfo.status === 'completed') {
            res.status(200).json({ cities: taskInfo.result })
        } else {
            res.status(202).json({ status: taskInfo.status })
        }
    } else {
        res.status(404).json({ status: 'unknown' })
    }
})

app.get('/all-cities', (req, res) => {
    const readStream = fs.createReadStream('addresses.json')
    readStream.pipe(res)
})

// 404 endpoint for undefined routes
app.use((req, res) => {
    res.status(404).send('404 - Page not found')
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})
