const express = require('express');
const store_capture = express.Router();
import { testEnvironmentVariable } from '../settings';

import {standardHost} from '../urls'

//FOR ASYNC AWAIT ROUTES
const wrap = fn => (...args) => fn(...args).catch(args[2])


var bodyParser =require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json()

// PARA ESTE MICROSERVICIO SE NECESITA INGRESAR LOS DATOS DE LA SIGUIENTE MANERA:
/* Ejemplo de Json del Body para el POST
    {
    "id_player": 2,
    "nameat": "Resistencia",
    "namecategory": "Físico",
    "data": 1,
    "data_type": "in.off",
    "input_source": "xlr8_podometer",
    "date_time": "2019-05-16 13:17:17"
    }
*/

store_capture.get("/", (req,res) =>{
    res.status(200).json({ message: testEnvironmentVariable})


});

store_capture.get("/test", (req,res) =>{
    res.status(200).json({ message: 'works'})
});


/*
Input:  Json of sensor data
Output: Void (stores the data in the db)
Description: Calls the b-Games-ApirestPostAtt service 
This function is used by devices that can post directly to the cloud service like mobile phones
*/
store_capture.post('/capture_external_data', jsonParser,  wrap(async(req,res,next) =>{
    
    var post_data = req.body;
    /*
        var id_player = req.body.id_player
        var id_sensor_endpoint = req.body.id_sensor_endpoint
        // [2,20,4,0,0]
        var data_changes = req.body.data_changes
        // Ej: [['chess_blitz','records',win'], ['elo'],['puzzle_challenge','record'],['puzzle_rush'],['chess_rapid','record','win']]
        var watch_parameters = req.body.watch_parameters
    
    */
   //FORCED PUSH 2
    console.log(post_data)

    var id_player = post_data.id_player;
    var id_sensor_endpoint = post_data.id_sensor_endpoint;
    var data_changes = post_data.data_changes;
    var watch_parameters = post_data.watch_parameters;
    console.log(id_player)
    console.log(id_sensor_endpoint)
    console.log(data_changes)
    console.log(watch_parameters)

    
    if(!id_player || !id_sensor_endpoint|| !data_changes|| !watch_parameters){
        res.status(400).json({
            status: `Error en enviar los datos, porfavor intentelo nuevamente`
        });  
    }
    let int_id_player = parseInt(post_data.id_player)
    let int_id_sensor_endpoint = parseInt(post_data.id_sensor_endpoint)

    let data_changes_array = []
    var data_changes_process = data_changes.split('.')
    var datas;
    var single_parameter_array;
    for (const single_parameter of data_changes_process) {
        datas = single_parameter.split(',')    
        single_parameter_array = []
        for (const data of datas){
            single_parameter_array.push(parseInt(data))
        }   
        data_changes_array.push(single_parameter_array)
    }

    var watch_parameters_array = []
    var watch_parameters_elements = watch_parameters.split('.')
   
    for (const single_parameter of watch_parameters_elements) {
        datas = single_parameter.split(',')    
        single_parameter_array = []
        for (const data of datas){
            single_parameter_array.push(data)
        }   
        watch_parameters_array.push(single_parameter_array)
    }

    console.log(watch_parameters_array)
   
    var options = {
        host :  standardHost,
        path: ('/standard_attributes_apis')       
    };
    var url = "http://"+options.host + options.path;
    console.log("URL "+url);
    var dataChanges = {  
        "id_player": int_id_player,   
        "id_sensor_endpoint": int_id_sensor_endpoint,
        "watch_parameters":watch_parameters_array,                                             
        "data_changes": data_changes_array
    }
    console.log(dataChanges)

    try {
        const response =  await axios.post(url,dataChanges);
        console.log(response)
        res.status(200).json({
            status: `Dato enviado correctamente`
        });   
        
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({
            status: `Error en enviar los datos, porfavor intentelo nuevamente`
        });  
    } 
    
}))
export default store_capture;

