export const cdmSchema = {
    "type" : "object",
    "properties" : {
        "cdmVersion" : { "type" :"string" },
        "tests" : { "type" :"array", "minItems" : 1, "items" : "#/$defs/test" },
        "assetInfo" : "#/$defs/assetInfo"
    },
    "required": [ "tests", "assetInfo" ],   
    "$defs" : { 
        "test" : {
            "type" : "object",
            "required" : [ "type", "label", "results"],
            "properties" : {
                "type" : {
                    "type" :"string"
                },
                "label" : {
                    "type" : "string"
                },
                "results" : {
                    "type" : "object",
                    "required" : ["status", "testTime", "data"],
                    "properties" : {
                        "status" :   { "type" : "string" },
                        "testTime" : { "type" : "string" },
                        "data" :     { "type" : "object"}
                    }
                }
            }
        },
        "assetInfo" : {
            "required" : ["assetType","uniqueId", "model", "serialNo", "swVersion" ],
            "properties" : {
                "assetType" : { "type" : "string" },
                "uniqueId" : { "type" : "string" },
                "model" : { "type" : "string" },
                "serialNo" : { "type" : "string" },
                "swVersion" : { "type" : "string" }
            }
        }
    }

}