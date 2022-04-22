# Binance_trading_bot

  WELCOME I'm Damiano Rovella,
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
  
  IF YOU HAVE SOME IDEA TO IMPROVE THE CODE CONTACT ME damiano.rovella@hotmail.com
