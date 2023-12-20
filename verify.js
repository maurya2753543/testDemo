import truePON from "./test/results/truePON-gponA.json" assert { type: "json" };
import tier1_mpo from "./test/results/Tier1-mpo-example.json" assert { type: "json"} ;
import { cdmSchema } from './cdmSchema.js'
import { Validator } from 'jsonschema'

//var Validator = require('jsonschema').Validator;
let v = new Validator;

console.log(v.validate(tier1_mpo, cdmSchema).errors);