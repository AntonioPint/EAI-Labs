
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

const counting = require("./classification/counting.js")
const preprocessing = require("./classification/preprocessing.js")
const termRepository = require("./database/repositories/termRepository.js");
const termStatisticRepository = require("./database/repositories/termStatisticRepository.js");


(async ()=>{


  let [termsOriginalNegative, termsOriginalPositive, termsStatistics] = await Promise.all([
    termRepository.getIdfOfTerms(0),
    termRepository.getIdfOfTerms(1),
    termStatisticRepository.getTermStatisticsFormated()
  ]);
  
  let ttl = 10 * 60 * 1000
          myCache.mset([
              { key: "termsOriginalNegative", val: termsOriginalNegative, ttl: ttl },
              { key: "termsOriginalPositive", val: termsOriginalPositive, ttl: ttl },
              { key: "termsStatistics", val: termsStatistics, ttl: ttl },
          ])
  
  function hasCache() {
    return !!myCache.get("termsOriginalNegative") &&
        !!myCache.get("termsOriginalPositive") &&
        !!myCache.get("termsStatistics")
  }
  
  


})();
