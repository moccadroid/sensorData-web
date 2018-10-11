import React, { Component } from 'react';
import './App.css';
import brain from 'brain.js/src';

import firestore from './firebase';

class App extends Component {
    
    constructor(props) {
        super(props);
        
        this.state = {
            data: null,
            testData: null
        };
    }
    
    async loadData() {
        try {
            //const testData = JSON.parse(this.state.testData);

            let wifiDoc = await firestore.collection('Test').doc('wifi').get();
            let wifiDocData = wifiDoc.data();
            let trainingData = Object.entries(wifiDocData.bedroom.wifiData).map(([key, value]) => {
                
                return value.levels.map(level => {
                    const line = {};
                    const input = {};
                    input[key] = Number((Math.abs(level) / 100).toFixed(2));
                    line['input'] = input;
                    line['output'] = { bedroom: 1};
                    return line;
                });
            });
            trainingData = [...trainingData, ...trainingData];
            
            
            //console.log(trainingData);
            //wifiDocData.bedroom.wifiData.
            //let magnetDoc = await firestore.collection('Test').doc('magnetometer').get();

            //console.log(this.state.testData);
            //console.log(wifiDoc.data());
            //console.log(magnetDoc.data());
            trainingData = trainingData.flat();
            console.log(trainingData);
            
            const net = new brain.NeuralNetwork();
            let start = Date.now();
            console.log('start training');
            await net.trainAsync(trainingData, { 
                log: detail => console.log(detail),
                momentum: 0.9
            });
            console.log('trained in: ' + Math.floor((Date.now() - start) / 1000));
            
            const testData = {};
            wifiDoc = await firestore.collection('Test1').doc('wifi').get();
            Object.entries(wifiDocData).forEach(([key, value]) => {
                testData[key] = Object.entries(value.wifiData).map(([key, value]) => {
                    let test = {};
                    //console.log(value);
                    test[key] = Number((Math.abs(value.levels[value.levels.length - 1]) / 100).toFixed(2));
                    return test;
                }); 
            });
            console.log(testData);
            
            console.log(net.run(testData['kitchen']));
            /*
            wifiDocData = wifiDoc.data();
            const testData = Object.entries(wifiDocData[room].wifiData).map(([key, value]) => {
                let test = {};
                //console.log(value);
                test[key] = value.levels[value.levels.length - 1];
                return test;
            });
            console.log(testData);
            
            const result = net.run(testData);
            console.log(result);
            */
            
        } catch (error) {
            console.log(error);
            console.log('the testdata isn\'t valid JSON');
        }
        
    }
    
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <textarea onChange={event => this.setState({ testData: event.target.value })} 
                              cols={60} 
                              rows={30}></textarea>
                    <a className="App-link" href="#" onClick={this.loadData.bind(this)}>load data</a>
                </header>
            </div>
        );
}
}

export default App;
