var JSONSchema = {
    "id": "http://json-schema.org/draft-04/schema#",
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "Core schema meta-schema",
    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#" }
        },
        "positiveInteger": {
            "type": "integer",
            "minimum": 0
        },
        "positiveIntegerDefault0": {
            "allOf": [ { "$ref": "#/definitions/positiveInteger" }, { "default": 0 } ]
        },
        "simpleTypes": {
            "enum": [ "array", "boolean", "integer", "null", "number", "object", "string" ]
        },
        "stringArray": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "format": "uri"
        },
        "$schema": {
            "type": "string",
            "format": "uri"
        },
        "title": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "default": {},
        "multipleOf": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
        },
        "maximum": {
            "type": "number"
        },
        "exclusiveMaximum": {
            "type": "boolean",
            "default": false
        },
        "minimum": {
            "type": "number"
        },
        "exclusiveMinimum": {
            "type": "boolean",
            "default": false
        },
        "maxLength": { "$ref": "#/definitions/positiveInteger" },
        "minLength": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "additionalItems": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "items": {
            "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
            ],
            "default": {}
        },
        "maxItems": { "$ref": "#/definitions/positiveInteger" },
        "minItems": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "maxProperties": { "$ref": "#/definitions/positiveInteger" },
        "minProperties": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "required": { "$ref": "#/definitions/stringArray" },
        "additionalProperties": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "definitions": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "properties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "patternProperties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "dependencies": {
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    { "$ref": "#" },
                    { "$ref": "#/definitions/stringArray" }
                ]
            }
        },
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {
            "anyOf": [
                { "$ref": "#/definitions/simpleTypes" },
                {
                    "type": "array",
                    "items": { "$ref": "#/definitions/simpleTypes" },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" }
    },
    "dependencies": {
        "exclusiveMaximum": [ "maximum" ],
        "exclusiveMinimum": [ "minimum" ]
    },
    "additionalProperties": false,
    "default": {}
}

var ParamJSONSchema = {};
jQuery.extend(true, ParamJSONSchema, JSONSchema);
ParamJSONSchema["properties"]["name"] = {
    "type": "string"
}
ParamJSONSchema["properties"]["passing"] = {
	"type": "string",
	"default": "keyvalue",
	"enum": ["keyvalue", "positional", "raw"]
}
//ParamJSONSchema["properties"]["positional"] = {
//	"type": "boolean",
//	"default": false
//}
//ParamJSONSchema["properties"]["raw"] = {
//		"type": "boolean",
//		"default": false
//}
ParamJSONSchema["definitions"]["simpleTypes"]["enum"].push("multistring");

var jsdl_schema = {
	"$schema": "http://json-schema.org/schema#",
    "name": "JsdlService", 
    "type": "object", 
    "definitions": {
        "inOutType": {
			"enum": ["json", "mixed"],
			"description": "Input or output type"
		}
	},
    "properties": {
        "operations": {
            "description": "Describes the operations of the services (the dictionary key is the operation name)",
            "required": false, 
            "type": "object",
            "patternProperties" : {
	            "^.+$": {
	                "type": "object", 
	                "properties": {
	                    "transport": {
	                        "description": "values: get|post|put|delete", 
	                        "type": "string"
	                    }, 
	                    "target": {
	                        "description": "Relative operation URL", 
	                        "type": "string"
	                    }, 
	                    "envelope": {
	                        "description": "values: json|url", 
	                        "type": "string"
	                    }, 
	                    "contentType": {
	                        "description": "default: application/json", 
	                        "type": "string"
	                    }, 
	                    "parameters": {
	                        "type": "array", 
	                        "items": {
	                            "description": "Defined as JSON Schema type. Exception: Default of 'required' is true",
	                            "$ref": "ParamJSONSchema"
	                        }
	                    }, 
	                    "returns": {
	                        "description": "Defined as JSON Schema type",
	                        "$ref": "JSONSchema"
	                    }, 
	                    "description": {
	                        "description": "Description of the operation", 
	                        "type": "string"
	                    },
	                    "inputType": { "$ref": "#/definitions/inOutType" },
	                    "outputType": { "$ref": "#/definitions/inOutType" },
	                },
	                "additionalProperties": false
	            }
			}
        }, 
        "types": {
            "description": "Describes types which are used by operations",
            "required": false, 
            "type": "array", 
            "items": {
                "description": "Defined as JSON Schema type",
                "$ref": "ParamJSONSchema"
            }
        }
    }
}