let http = require('http');
let request = require('request');

http.get('http://norvig.com/big.txt', function (response) {
    response.setEncoding('utf8');
    if (response.statusCode == 200) {
        let data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });

        response.on('end', async () => {
            let wordArray = getSplitWords(data);
            let wordHash = getwordFrequency(wordArray);
            let topWords = getTopWords(wordHash);
            let output = await getApiData(topWords,wordHash);
            console.log(JSON.stringify(output,null,2));
        });
    }
});

function getSplitWords(text){
    return text.split(/\s+/);
}

function getwordFrequency(wordArray){    
    let wordHash = {};
    wordArray.forEach(function(key) { 
        wordHash[key] = wordHash.hasOwnProperty(key) ? ++wordHash[key] : 1;
    });
    return wordHash;
}

function getTopWords(wordHash){
    let values = Object.values(wordHash);
    topWords = [];
    topCount = values.sort(function(a,b){return b - a }).slice(0,10);
    topCount.forEach(function(val){
        topWords.push(Object.keys(wordHash).find(key => wordHash[key] === val));
    })
    return topWords;
}

async function getApiData(topWords,wordHash){
    let jsonOutput = [];
    let url = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup';
    let key = 'dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf';
    for (const word of topWords) {
        let options = {};
        options['key'] = key;
        options['lang'] = 'en-en';
        options['text'] = word;

        let data = await getData(url,options);
        let outputObject = constructJSON(data,word,wordHash[word]);
        jsonOutput.push(outputObject);
    }
    return jsonOutput;
}

function getData(url,options){
    return new Promise(function(resolve,reject){
        request({url:url,qs:options},function(error,response,body){
            if(!error && response.statusCode == 200){
                resolve(JSON.parse(body));
            }
            else{
                console.log("Encountered error! Rejecting!");
                reject(error);
            }
        })
    })
}

function constructJSON(body,word,count){
    let tmp = {};
    tmp['word'] = word;
    let output = {};
    output['count'] = count;
    if(body.def && body.def.length > 0){    
        output['pos'] = body.def[0].pos;
        // considering tr elements as synonyms
        /* output['syn'] = [];
        if(body.def[0].tr && body.def[0].tr.length > 0){
            body.def[0].tr.forEach(ele=>{
                attr = {'word': ele.text,'pos': ele.pos}
                output['syn'].push(attr);
            })
        }
        tmp['output'] = output; */

        // considering all syn elements of tr as synonyms
        output['syn'] = [];
        if(body.def[0].tr && body.def[0].tr.length > 0){
            body.def[0].tr.forEach(ele =>{
                if(ele.syn && ele.syn.length > 0){
                    ele.syn.forEach(elt =>{
                        output.syn.push(elt);
                    })
                }
            })
        }
    }
    tmp['output'] = output;
    return tmp;
}