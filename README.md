# Binance_trading_bot

  WELCOME I'm Damiano Rovella,<br>
  here there is a smart configuration for start trading.<br>
  PLEASE CHECK IN THE BUY AND SELL FUNCTION, DEFAULT IS ONLY IN TEST MODE<br><br>

  WORK MODE : path: `/api/v3/order?${query_string}&signature=${signature}`, <br>
  TEST MODE : path: `/api/v3/order/test?${query_string}&signature=${signature}`,<br><br>
  TEST MODE <br>
      //path: `/api/v3/order?${query_string}&signature=${signature}`,<br>
      path: `/api/v3/order/test?${query_string}&signature=${signature}`,<br>
  EARN MODE<br>
      path: `/api/v3/order?${query_string}&signature=${signature}`,<br>
      //path: `/api/v3/order/test?${query_string}&signature=${signature}`,<br><br>
  trade_value: "AXSBTC",      -> your pair crypto you want to trade, the earn where put into BTC in my case<br>
  quantity: 13,               -> how many BTC you want to spend trade<br>
  time_recall: 1000,          -> how many time you want to check if is the time to sell/buy/trade <br>
  api_key: "",                -> your binance api key<br>
  api_secret: "",             -> you api secret<br>
  take_profit_percent: 0.20,  -> when you reach the take profit % it sell automatically - if the trend are increasing it may wait for optimize the selling value<br>
  perc_loss_trade: -900.2,    -> if you set the perc loss then the value go down he sells and prepare for new buy<br>
  time_frame: "1m",           -> candle time frame<br>
  time_frame_long: "5m",      -> candle time frame<br>
  stop_trade: (-4)            -> if you lose an amount of 4% down it stop work<br>
  it work in a very simple mode, he control the 2 candle time frame and where the short is under the long he buy.<br>
  
  for make it work properly you need to launch this nodejs file with forever<br>
  
  <h3>IF YOU HAVE SOME IDEA TO IMPROVE THE CODE CONTACT ME damiano.rovella@hotmail.com<h3>
