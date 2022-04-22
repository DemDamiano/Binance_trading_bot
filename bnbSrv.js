
let https = require('https');
let crypto = require('crypto');
let fs = require('fs');
let trend = require('trend');

const { Console } = require('console');
const { format } = require('path');

/*
    Created from DAMIANO ROVELLA, this is a development kit, for any upgrade contact me on, damiano.rovella@hotmail.com
*/

let candleJSON      = [];
let candleJSON_lngTF= [];
let highOldCandle   = [];
let lowOldCandle    = [];

let indexOldCandle  = 0;
let netGain = 0;
let moneyGain = 0;

let _decreaseTrend      = 100;
let _increaseTrend      = 100;
let _waitTrend          = 100;
let _oldIncreaseTrend   = 100;
let _oldDecreaseTrend   = 100;

let priceAverArray  = [];
let priceArray      = [];
let realGainArray   = [];
let checkTypeArray  = [];


let iPrice      = 1;
let percEarn    = 0;
let bought      = 0;
let sunEarn     = 0;
let priceAver   = 0;
let priceSum    = 0;
let timeBought  = 0;
let sma         = 0;
let sma_lngTF   = 0
let startTrade  = 0;

let cnt_buy     = 0;
let cnt_sell    = 0;
let iRealGain   = 0;

let iAver = 0;
let log_buy;
let iCheckArray = 0;

/*
  WELCOME,
  here there is a smart configuration for start trading.
  PLEASE CHECK IN THE BUY AND SELL FUNCTION, DEFAULT IS ONLY IN TEST MODE
  
  WORK MODE : path: `/api/v3/order?${query_string}&signature=${signature}`,
  TEST MODE : path: `/api/v3/order/test?${query_string}&signature=${signature}`,

  TEST MODE 
      //path: `/api/v3/order?${query_string}&signature=${signature}`,
      path: `/api/v3/order/test?${query_string}&signature=${signature}`,

  EARN MODE
      path: `/api/v3/order?${query_string}&signature=${signature}`,
      //path: `/api/v3/order/test?${query_string}&signature=${signature}`,

  trade_value: "AXSBTC",      -> your pair crypto you want to trade, the earn where put into BTC in my case
  quantity: 13,               -> how many BTC you want to spend trade
  time_recall: 1000,          -> how many time you want to check if is the time to sell/buy/trade 
  api_key: "",                -> your binance api key
  api_secret: "",             -> you api secret
  take_profit_percent: 0.20,  -> when you reach the take profit % it sell automatically - if the trend are increasing it may wait for optimize the selling value
  perc_loss_trade: -900.2,    -> if you set the perc loss then the value go down he sells and prepare for new buy
  time_frame: "1m",           -> candle time frame
  time_frame_long: "5m",      -> candle time frame
  stop_trade: (-4)            -> if you lose an amount of 4% down it stop work

  it work in a very simple mode, he control the 2 candle time frame and where the short is under the long he buy.
  
  for make it work properly you need to launch this nodejs file with forever
*/

const config = {
    trade_value: "AXSBTC",
    quantity: 13,
    time_recall: 1000,
    api_key: "",
    api_secret: "",
    take_profit_percent: 0.20,
    perc_loss_trade: -900.2,
    time_frame: "1m", 
    time_frame_long: "5m",
    stop_trade: (-4)    
};


let sellMoneyGain  = config.quantity.toFixed(1);
/*  
    Time Frame: 
        1m
        3m
        5m
        15m
        30m
        1h
        2h
        4h
        6h
        8h
        12h
        1d
        3d
        1w
        1M    
*/
function init_management() {
    console.log(``);
    console.log(`... Henry is trading - ${config.trade_value} ...`);
    console.log(``);

    log_buy = fs.createWriteStream('buy.txt', {//Save the file in the same folder of the project
        flags: 'w+' // 'a' means appending (old data will be preserved)
    });

    console.log(`------------------------------------------------`);
    console.log(`DATA READ FROM FILE ${readTextFile()}`);
    
    if(readTextFile() == ''){
        console.log("NOTHING TO READ")
    }else{
        console.log("SOMETHING TO READ")
        priceArray[1] = readTextFile();
        bought = 1;
        cnt_sell = 0;
        cnt_buy = 1;
    }

    console.log(`------------------------------------------------`);
    setInterval(loop_management, config.time_recall);
}

init_management();
let old_iPrice;
function loop_management() {
    
    if(sunEarn>config.stop_trade)   
    {   
        console.log(".")
        candleStick();
        old_iPrice = iPrice;
    }   
    else    console.log(`...to much lost...`)
}

function candleStick() {
    let data            = '';
    let openCndlStick   = 0;
    let lowCndlStick    = 0;
    let highCndlStick   = 0;
    let closeCndlStick  = 0;
 
    let data_lngTF            = '';     
    let openCndlStick_lngTF   = 0;
    let lowCndlStick_lngTF    = 0;
    let highCndlStick_lngTF   = 0;
    let closeCndlStick_lngTF  = 0;

    try{
        https.get(`https://api3.binance.com/api/v3/klines?symbol=${config.trade_value}&interval=${config.time_frame}&limit=1`, (resp) => {
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('close', () => {
    
                let auxSplit = data.split(",");

                if(typeof(auxSplit[1]!=="undefined")) openCndlStick   = auxSplit[1].replace('"', '').substring(0, auxSplit.length - 1);
                if(typeof(auxSplit[2]!=="undefined")) highCndlStick   = auxSplit[2].replace('"', '').substring(0, auxSplit.length - 1);
                if(typeof(auxSplit[3]!=="undefined")) lowCndlStick    = auxSplit[3].replace('"', '').substring(0, auxSplit.length - 1);
                if(typeof(auxSplit[4]!=="undefined")) closeCndlStick  = auxSplit[4].replace('"', '').substring(0, auxSplit.length - 1);
    
                closeCndlStick  = closeCndlStick.replace(`"`, ``)
                openCndlStick   = openCndlStick.replace(`"`, ``)
                lowCndlStick    = lowCndlStick.replace(`"`, ``)
                highCndlStick   = highCndlStick.replace(`"`, ``)
    
                let auxSum  = 0;
                let nmbrRow = 0;
                for (row in candleJSON) {
                    auxSum = Number(auxSum) + ((Number(lowCndlStick)+Number(highCndlStick))/2);
                    nmbrRow++;
                    sma = auxSum / nmbrRow;
                }
    
                candleJSON.push({ high: highCndlStick, open: openCndlStick, low: lowCndlStick, close: closeCndlStick, sma: sma });
                
                highOldCandle[indexOldCandle]   = JSON.parse(candleJSON[indexOldCandle].high);
                lowOldCandle[indexOldCandle]    = JSON.parse(candleJSON[indexOldCandle].open);
                
                define_trend(highOldCandle,lowOldCandle);

                indexOldCandle++;
                
                try{
                    https.get(`https://api3.binance.com/api/v3/klines?symbol=${config.trade_value}&interval=${config.time_frame_long}&limit=1`, (resp) => {
                        resp.on('data', (chunk_longTF) => {
                            data_lngTF += chunk_longTF;
                        });
                        resp.on('close', () => {
                
                            let auxSplit = data_lngTF.split(",");
                            if(typeof(auxSplit[1]!=="undefined")) openCndlStick_lngTF   = auxSplit[1].replace('"', '').substring(0, auxSplit.length - 1);
                            if(typeof(auxSplit[2]!=="undefined")) highCndlStick_lngTF   = auxSplit[2].replace('"', '').substring(0, auxSplit.length - 1);
                            if(typeof(auxSplit[3]!=="undefined")) lowCndlStick_lngTF    = auxSplit[3].replace('"', '').substring(0, auxSplit.length - 1);
                            if(typeof(auxSplit[4]!=="undefined")) closeCndlStick_lngTF  = auxSplit[4].replace('"', '').substring(0, auxSplit.length - 1);
                
                            closeCndlStick_lngTF  = closeCndlStick_lngTF.replace(`"`, ``)
                            openCndlStick_lngTF   = openCndlStick_lngTF.replace(`"`, ``)
                            lowCndlStick_lngTF    = lowCndlStick_lngTF.replace(`"`, ``)
                            highCndlStick_lngTF   = highCndlStick_lngTF.replace(`"`, ``)
                
                            let auxSum  = 0;
                            let nmbrRow = 0;
                            for (row in candleJSON_lngTF) {
                                auxSum = Number(auxSum) + Number(highCndlStick_lngTF);
                                nmbrRow++;
                                sma_lngTF = auxSum / nmbrRow;
                            }
                
                            candleJSON_lngTF.push({ high: highCndlStick_lngTF, open: openCndlStick_lngTF, low: lowCndlStick_lngTF, close: closeCndlStick_lngTF, sma: sma_lngTF });

                            trade();
                        });
                        resp.on("error", (err) => {
                            console.log("............................");
                            console.log("Error get candle: ", err.message);
                            console.log("............................");
                            //restart();
                        });
                    });
                }catch(error){
                    console.log(`exception occurred during candle reading, ${error}`)
                }
            });
            resp.on("error", (err) => {
                console.log("............................");
                console.log("Error get candle: ", err.message);
                console.log("............................");
                //restart();
            });
        });
    }catch(error){
        console.log(`exception occurred during candle reading, ${error}`)
    }
}

function define_trend(highCandleJson,lowCandleJson){
    let i_cndl  = highCandleJson.length;

    if((highCandleJson[i_cndl-7] > highCandleJson[i_cndl-1])) {
        _decreaseTrend = 1;
        _increaseTrend = 0;
        _waitTrend     = 0;
    }

    if((highCandleJson[i_cndl-5] < highCandleJson[i_cndl-3] && highCandleJson[i_cndl-3] < highCandleJson[i_cndl-1])){
        _increaseTrend = 1;
        _decreaseTrend = 0;
        _waitTrend     = 0;
    } 
    
    if((highCandleJson[i_cndl-15] == highCandleJson[i_cndl-1])) {
        _waitTrend = 1;
        _increaseTrend = 0;
        _decreaseTrend = 0;
    }
}

function trade() {


    try{
    https.get(`https://api3.binance.com/api/v3/ticker/price?symbol=${config.trade_value}`, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;

        });
        resp.on('close', () => {

            //save the start trading date
            if(!startTrade){
                const timeElapsed = Date.now();
                const today = new Date(timeElapsed);
                today.setHours(today.getHours() + 2 );
                startTrade = today.toUTCString(); // "Sat, 13 Jun 2020 18:30:00 GMT"
            }   
                 
            let c_name = JSON.parse(data).symbol;
            let c_price = JSON.parse(data).price;
            let index_old = iPrice - 1;

            priceArray[iPrice] = c_price; 

            if(iPrice>2){
                iAver++;
                priceSum = Number(priceSum) + Number(c_price)
                priceAver = (priceSum / Number(iAver));
                priceAverArray[iAver] = priceAver;
                if(iAver>20){
                    iAver = 0;
                    priceSum = 0;   
                    priceAver = [];
                }   
            }   

            let c_pricePerc= ((Number(c_price)*(Number(config.take_profit_percent)))/100);

            let calmSell = 0;
            if(realGainArray[iRealGain -1] != netGain) {
                realGainArray[iRealGain]= netGain;
                iRealGain ++;
            }
            if(netGain>0){
                realGainArray = [];
                iRealGain = 0;
            }

            if(iRealGain>8 && realGainArray[iRealGain -2] > realGainArray[iRealGain-1] && realGainArray[iRealGain-1] < 0) calmSell = 1;


            percEarn = ((c_price - priceArray[bought]) / priceArray[bought]) * 100;
            percEarn = Number(percEarn)
          
            
             if(((checkType(priceArray) == 1) && increasing() && (sma < sma_lngTF) && ((c_price-c_pricePerc)<sma)) && !bought && cnt_buy == cnt_sell){ 
             
                let timeStamp = Date.now();
                bought = 0.1; //Set it to 0.1 for control if the buy function work or not

                buy(c_price, priceArray, bought, index_old, iPrice, timeStamp);
                const timeElapsed = Date.now();
                const today = new Date(timeElapsed);
                today.setHours(today.getHours() + 2 );
                timeBought = today.toUTCString();

                log_buy.write(c_price);

            }else if(((percEarn<=config.perc_loss_trade) || (priceArray[iPrice-1]>priceArray[iPrice] && percEarn>= config.take_profit_percent)) && 
                bought>0.1 && cnt_buy>cnt_sell && !calmSell) {
                

                sunEarn = Number(sunEarn) + Number(percEarn);
                let timeStamp = Date.now();;

                sell(c_price, priceArray, bought, index_old, iPrice, timeStamp);
                fs.truncate('buy.txt', 0, function(){console.log('done')})
    
                restart();
            } else {
                
                netGain  = (percEarn-((2)*0.075)); 
                let sunNetGain =(sunEarn-((cnt_buy+cnt_sell)*0.075));
                moneyGain = ((config.quantity*netGain)/100)
                sellMoneyGain = moneyGain+config.quantity;
                sellMoneyGain = sellMoneyGain.toFixed(2);
                console.log(`_______________________________________________________`);
                console.log(`________${iPrice} WAIT____________`);
                console.log(`crypto     = ${c_name}`);
                console.log(`start time = ${startTrade}`);
                console.log(`__________`);
                console.log(`quantity   = ${config.quantity}`); 
                console.log(`tf short   = ${config.time_frame}`);
                console.log(`tf long    = ${config.time_frame_long}`)
                console.log(`tp         = ${config.take_profit_percent}`);
                console.log(`sl         = ${config.perc_loss_trade}`);
                console.log(`stop trade = ${config.stop_trade}`)
                console.log(`__________`);
                console.log(`price      = ${c_price}`);
                console.log(`time       = ${timeBought}`);
                console.log(`bought     = ${priceArray[bought]}`);
                console.log(`__________`);
                console.log(`sma        = ${sma}`);
                console.log(`sma long tf= ${sma_lngTF}`)
               // console.log(`priceAver  = ${priceAver}`);
                console.log(`_______________________________________________________`);
                console.log(`percE	    = ${percEarn} %`);
                console.log(`sumE	    = ${sunEarn} %`);
                console.log(`Cnt b    	= ${cnt_buy}`);
                console.log(`Cnt s   	= ${cnt_sell}`);
                console.log(`Real gain  = ${netGain} %`);
                console.log(`Sum net    = ${sunNetGain}`);
                /*console.log(`_______________________________________________________`);
                console.log(`Money gain  = ${moneyGain}`)
                console.log(`Money sell  = ${sellMoneyGain}`)
                console.log(`_______________________________________________________`);
                */

                /*
                    we print the console menù on the .txt file
                */ 
                let send= `
                _______________________________________________________
                ________${iPrice} WAIT____________
                cry                 = ${c_name}
                qta traded          = ${config.quantity}
                tf                  = ${config.time_frame}
                sl                  = ${config.perc_loss_trade}
                tp                  = ${config.take_profit_percent}
                price now           = ${c_price}
                bought price        = ${priceArray[bought]}
                time bought event   = ${timeBought}
                sma                 = ${sma}
                sma long time frame = ${sma_lngTF}
                priceAver           = ${priceAver}
                percEarn    	    = ${percEarn} %
                sumEarn     	    = ${sunEarn} %
                Cnt buy event    	= ${cnt_buy}
                Cnt sell event   	= ${cnt_sell}
                Real gain           = ${netGain}
                _______________________________________________________
                `
               
            }

            if(bought == 0.1) console.log(`Not bought succesfully`)

            if(_increaseTrend != _oldIncreaseTrend && !_waitTrend)
                _oldIncreaseTrend = _increaseTrend;
            if(_decreaseTrend != _oldDecreaseTrend && !_waitTrend)
                _oldDecreaseTrend = _decreaseTrend;
            
            _oldWait = _waitTrend;
            iPrice++;
        })
    });
    }catch(exception){
        console.log(`exception occurred during price reading, ${error}`)
    }
}

function sell(_c_price, _priceArray, _bought, _index_old, _iPrice, _timeStamp) {
    try{
        percEarn = ((_c_price - _priceArray[_bought]) / _priceArray[_bought]) * 100;
        _priceArray[_iPrice] = percEarn;
    
        console.log(`SELL-> old-value -> ${_priceArray[_index_old]}, price -> ${_c_price}, price bought -> ${_priceArray[_bought]}, perc earn -> ${percEarn}, E -> ${_priceArray[_bought]}`);
    
        //sumAver = percEarn + sumAver;
    
        const query_string = `symbol=${config.trade_value}&side=SELL&type=MARKET&quoteOrderQty=${config.quantity}&timestamp=${_timeStamp}`; //'timestamp=1578963600000';
        let signature = crypto.createHmac('sha256', config.api_secret).update(query_string).digest('hex');
    
        const options = {
            hostname: 'api3.binance.com',
            //path: `/api/v3/order?${query_string}&signature=${signature}`,
            path: `/api/v3/order/test?${query_string}&signature=${signature}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': `${config.api_key}`,
            }
        };
    
        let data = '';
    
        const req = https.request(options, (res) => {
    
            //console.log('Status Code:', res.statusCode);
           //if(res.statusCode == 200){
    
                res.on('data', (chunk) => {
                    data += chunk;
                });
    
                res.on('end', () => {
                    console.log("............................");
                    console.log('Sold! ', JSON.parse(data));
                    console.log("............................");
                    cnt_sell++;
                    bought = 0; //->ALTRIMENTI DEVE ESSERE 0.1
                });
            //}
            }).on("error", (err) => {
                console.log("............................");
                console.log("Error sold: ", err.message);
                console.log("............................");
                restart();
            });
    
            req.write(data);
            req.end();
    }catch(error){
        console.log(`exception occurred during sell, ${error}`)
    }
}

function buy(_c_price, _priceArray, _bought, _index_old, _iPrice, _timeStamp) {
    try{
        console.log("timee ", _timeStamp)
        
    
        console.log(`BUY-> old-value -> ${_priceArray[_index_old]}, price -> ${_c_price}, E -> ${config.quantity}`);
    
        const query_string = `symbol=${config.trade_value}&side=BUY&type=MARKET&quoteOrderQty=${config.quantity}&timestamp=${_timeStamp}`; //'timestamp=1578963600000';
        let signature = crypto.createHmac('sha256', config.api_secret).update(query_string).digest('hex');
    
        const options = {
            hostname: 'api3.binance.com',
            //path: `/api/v3/order?${query_string}&signature=${signature}`,
            path: `/api/v3/order/test?${query_string}&signature=${signature}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': `${config.api_key}`,
            }
        };
    
        let data = '';
    
        const req = https.request(options, (res) => {
    
            console.log('Status Code:', res.statusCode);
            //if(res.statusCode == 200){
                res.on('data', (chunk) => {
                    data += chunk;
                });
        
                res.on('end', () => {
                    console.log("............................")
                    console.log('Bought! ', data, JSON.parse(data));
                    console.log("............................");
                    bought = iPrice;
                    cnt_buy ++;
                });
           // }else{
             //   bought = 0;
            //}
        }).on("error", (err) => {
            console.log("............................");
            console.log("Error buy: ", err.message);
            console.log("............................");
            restart();
        });
    
        req.write(data);
        req.end();
    }catch(error){
        console.log(`exception occurred during buy, ${error}`)
    }
    
        
}


function restart(){

    indexOldCandle = 0;

    _decreaseTrend    = 100;
    _increaseTrend    = 100;
    _waitTrend        = 100;
    _oldIncreaseTrend = 100;
    _oldDecreaseTrend = 100;
    _oldWait          = 100;
    
    priceArray      = [];

    percEarn    = 0;
    iPrice      = 1;
    bought      = 0;
    priceAver   = 0;
    timeBought  = 0;
    sma         = 0;
    startTrade  = 0;
    priceSum    = 0;    
    iAver = 0;
}

function checkType(arr)
{
    /*
        0 -> undefined
        1 -> increase
        2 -> decrease
        3 -> wawe (increase - decrease)
        4 -> wawe2 (decrease - increase)
    */
    let response = 0;
    let n= arr.length
 
    if(n>20){
        if (arr[(n-(Math.floor(n/2)))] < arr[n - 10] && arr[n - 7] <= arr[n - 1]) response = 1;
        else if (arr[(n-(Math.floor(n/2)))] > arr[n - 10] && arr[n - 7] >= arr[n - 1]) response = 2;
        else if (arr[(n-(Math.floor(n/2)))] < arr[n - 10] && arr[n - 7] >= arr[n - 1]) response = 3;
        else if (arr[(n-(Math.floor(n/2)))] > arr[n - 10] && arr[n - 7] <= arr[n - 1]) response = 4;    
        
        checkTypeArray[iCheckArray]=response;
        
        iCheckArray++;
    }
    return response;
}

function increasing(){
    let counterR0 = 0;
    let counterR1 = 0;
    let counterR2 = 0;
    let counterR3 = 0;
    let counterR4 = 0;
    let oldCounterR0;
    let oldCounterR1;
    let oldCounterR2;
    let oldCounterR3;
    let oldCounterR4;

    for(let i=0; i<checkTypeArray.length; i++){
        if(checkTypeArray[i]==0) counterR0++
        if(checkTypeArray[i]==1) counterR1++
        if(checkTypeArray[i]==2) counterR2++
        if(checkTypeArray[i]==3) counterR3++
        if(checkTypeArray[i]==4) counterR4++
    }
    if(oldCounterR0>counterR0 || oldCounterR2>counterR2 || oldCounterR3>counterR3 || oldCounterR4>counterR4){
        checkTypeArray=[];
        iCheckArray = 0;
        return 0;
    }
    
    oldCounterR0 = counterR0;
    oldCounterR1 = counterR1;
    oldCounterR2 = counterR2;
    oldCounterR3 = counterR3;
    oldCounterR4 = counterR4;
    //console.log(`counter1 ${counterR0} - counter1 ${counterR1} -counter1 ${counterR2} -counter1 ${counterR3} -counter1 ${counterR4}`)
    if(counterR1>counterR0 && counterR1>counterR2 && counterR1>counterR3 && counterR1>counterR4) {
        return 1
    }
    else{        
        return 0;
    }
}

function readTextFile()
{ 
    let returned_data;
    try {
        const data = fs.readFileSync('buy.txt', 'utf8')
        returned_data = data;
        //console.log(`DATA READ FROM FILE${data}`)
    } catch (err) {
        console.error(err)
    }

    return returned_data
}
