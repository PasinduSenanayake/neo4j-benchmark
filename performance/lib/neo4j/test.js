"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * This module decription
 * @module path/moduleFileName
 * @see module:path/referencedModuleName
 */

/* import modules */
const Promise = require("bluebird");
const neo4j = require('neo4j-driver').v1;
const csv = require('csv-parser');
const fs = require('fs');

// const host  = 'bolt://mc17.cs.purdue.edu';
const host  = 'bolt://localhost';

/* input for testing */
const input = __dirname + '/../../data/directors-20000.csv';;

// Create a driver instance, for the user neo4j with password neo4j.
// It should be enough to have a single driver per database per application.
var driver = neo4j.driver(host, neo4j.auth.basic("neo4j", "trueno"));

// Register a callback to know if driver creation was successful:
driver.onCompleted = function() {
    // proceed with using the driver, it was successfully instantiated
    console.log('Driver instantiation success');
    // start test
    doTest();
};

// Register a callback to know if driver creation failed.
// This could happen due to wrong credentials or database unavailability:
driver.onError = function(error) {
    console.log('Driver instantiation failed', error);
};

// Create a session to run Cypher statements in.
// Note: Always make sure to close sessions when you are done using them!
let session = driver.session();

let query1 = "MATCH (d:Director) -[]-> () WHERE d.name = {name} RETURN d";
let query3 = "MATCH (d:Director) -[r:FILMS]-> (f:Film) WHERE d.name = {name} RETURN f"

let hrstart = [];
let hrend = [];

function getDirector(director, resolve, reject) {
    let param1 = {name: director};
    let result = session.run(query1, param1);

    return new Promise(() => {
        result
            .subscribe({
                onNext: function(record) {
                    // console.log('onNext');
                },
                onCompleted: function() {
                    resolve();
                    // console.log('onCompleted');
                },
                onError: function(error) {
                    // console.log('onError');
                    console.log(error);
                    reject();
                }

            });
    });
}

// get all the films of a director
function getFilms(director, resolve, reject) {
    let param3 = {name: director};
    let result = session.run(query3, param3);

    return new Promise(() => {
        result
            .subscribe({
                onNext: function(record) {
                    // console.log('onNext');
                },
                onCompleted: function() {
                    resolve();
                    // console.log('onCompleted');
                },
                onError: function(error) {
                    // console.log('onError');
                    console.log(error);
                    reject();
                }

            });
    });

        // .then(function(records) {
        //     records.forEach((record) => {
        //         for (let i in record) {
        //             console.log(i, ' --> ', record[i]);
        //         }
        //     });
        //
        //     let summary = result.summarize();
        //     console.log(summary.updateStatistics.nodesCreated())
        // })
        // .catch(function(error) {
        //     console.log('run --> catch: ', name);
        //     console.log(error);
        // })
        // .then(function() {
        //     console.log('session closed!')
        //     session.close();
        // });
}

function singleReads() {

    let self = this;
    let directors = [];
    let promiseArray = [];

    return new Promise((resolve, reject) => {

        fs.createReadStream(input)
            .pipe(csv({separator: ','}))
            .on('data', function(data) {
                // console.log('-->', data.name);
                directors.push(data.name);
            })
            .on('end', function() {
                console.log('----> end');

                hrstart[0] = process.hrtime();

                for (let k in directors) {
                    promiseArray.push(
                        new Promise((resolve, reject) => {
                            /* Retrieve films */
                            getDirector(directors[k], resolve, reject);
                        })
                    )
                }

                Promise.all(promiseArray).then(() => {
                    hrend[0] = process.hrtime(hrstart[0]);
                    console.log('Single Reads     %ds %dms', hrend[0][0], hrend[0][1]/1000000);
                    session.close();
                    resolve();
                });
            })
    })

}

function singleWrites() {

}

function neighbors() {

    let self = this;
    let directors = [];
    let promiseArray = [];

    let hrstart = process.hrtime();

    return new Promise((resolve, reject) => {

        fs.createReadStream(input)
            .pipe(csv({separator: ','}))
            .on('data', function(data) {
                // console.log('-->', data.name);
                directors.push(data.name);
            })
            .on('end', function() {
                // console.log('----> end');

                hrstart[2] = process.hrtime();
                for (let k in directors) {
                    promiseArray.push(
                        new Promise((resolve, reject) => {
                            /* Retrieve films */
                            getFilms(directors[k], resolve, reject);
                        })
                    )
                }

                Promise.all(promiseArray).then(() => {
                    hrend[2] = process.hrtime(hrstart[2]);
                    console.log('Neighbors        %ds %dms', hrend[2][0], hrend[2][1]/1000000);
                    session.close();
                    resolve(hrend - hrstart);
                });
            })
    })

}




// Retrieve all directors
// session
//     .run(query1)
//     .then(result => {
//
//         console.log('retrieving data...')
//         // Iterate thru all directors
//         for (let key in result.records) {
//             // Retrieve movies from each director
//             getFilms(result.records[key].get('d'));
//         }
//         session.close();
//     })
//     .catch(error => {
//         console.log(error);
//     })

function doTest() {

    console.log('neo4j');
    console.log('doTest');

    /* single reading */
    singleReads();

    /* neighbors reading */
    // neighbors();

    // Close driver instance
    // driver.close();
}
