pasatiempos = [["clan", "pena", "remato", "torero"],
    ["acné", "arre", "abobar", "aboral"],
    ["boli", "frío", "cúbico", "íncubo"]]

//Pasatiempo2: acné acre agre arce ayer arre abobar abobra abocar abogar abonar aboral
//Pasatiempo3: bopli biro bodi biso brio frío cúbico cubito púbico búdico cúbito íncubo

const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = 8080

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*")
    res.header('Access-Control-Allow-Headers', "POST, Content-Type")
    next()
}

app.set('json spaces', 40);
app.use(express.json());
app.use(allowCrossDomain);
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.post('/server', function (req, res){
    res.send( comprobar_definicion(req.body.palabra, req.body.fila, req.body.pasatiempo_activo))
});

app.listen(port, (req, res) => {
    console.log(`Pasatiempo listening at http://localhost:${port}`)
})

function comprobar_definicion(palabra, fila, pasatiempo_activo){
    if (fila == 0){
        fila = 0
    }else if (fila == 5){
        fila = 1
    }else if (fila == 6){
        fila = 2
    }else if (fila == 11){
        fila = 3
    }

    return pasatiempos[pasatiempo_activo-1][fila] === palabra
}