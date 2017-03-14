/* Generated from Java with JSweet 1.2.0 - http://www.jsweet.org */
var ElasticClient = org.trueno.driver.lib.core.search.ElasticClient;
var CSVReader = com.opencsv.CSVReader;
var FileReader = java.io.FileReader;
/**
 * Created by Maverick-zhn on 7/20/16.
 */
var driver = (function () {
    function driver() {
    }
    driver.main = function (args) {
        console.info("Calling Elastic Search...");
        var eClient = new ElasticClient("trueno", "localhost");
        eClient.connect();
        var totalstartTime = java.lang.System.currentTimeMillis();
        var total = driver.bulk(eClient);
        var totalestimatedTime = java.lang.System.currentTimeMillis() - totalstartTime;
        console.info("Single Reads: " + (totalestimatedTime / 1000.0) + "s " + (totalestimatedTime) + "ms" + " " + total / (totalestimatedTime / 1000.0) + " records/s");
    };
    driver.search = function (eClient) {
        var csvFile = "/Users/victor/Desktop/neo4j-benchmark/elastic-search-java/src/main/java/directors-20000.csv";
        var reader = null;
        var total = 0;
        try {
            reader = new CSVReader(new FileReader(csvFile));
            var line = void 0;
            while (((line = reader.readNext()) != null)) {
                var q = "{\"term\":{\"prop.name\":\"" + line[1] + "\"}}";
                var results = eClient.search(q, "movies", "v", 1000);
                total++;
            }
            ;
        }
        catch (e) {
            console.error(e.message, e);
        }
        ;
        return total;
    };
    driver.bulk = function (eClient) {
        var total = 0;
        var operations = [["index", "v", "3302", "{\"id\":3302,\"jobId\":null,\"label\":\"Film\",\"prop\":{\"id\":3302,\"filmId\":\"m.06_x8j_\",\"name\":\"Under U Cloud\",\"release_date\":\"1937-08-01\"},\"comp\":{},\"meta\":{},\"partition\":null }"], ["index", "v", "3303", "{\"id\":3303,\"jobId\":null,\"label\":\"Film\",\"prop\":{\"id\":3303,\"filmId\":\"m.06zmzms\",\"name\":\"Night Time in Nevada\",\"release_date\":\"1948-01-01\"},\"comp\":{},\"meta\":{},\"partition\":null  }"], ["delete", "v", "3004", ""], ["delete", "v", "3005", ""]];
        eClient.bulk("movies", operations);
        return total;
    };
    return driver;
}());
driver["__class"] = "driver";
driver.main(null);